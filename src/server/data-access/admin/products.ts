import {
  and,
  asc,
  eq,
  gt,
  ilike,
  inArray,
  isNotNull,
  isNull,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";
import { AppError } from "~/lib/errors/app-error";
import { productAttributeValues } from "~/server/db/schema/attributes";
import { inventoryItems } from "~/server/db/schema/inventory";
import { db, type Tx } from "../../db";
import {
  media,
  orderItems,
  orders,
  productOptions,
  productOptionValues,
  productOptionValuesVariants,
  products,
  productsMedia,
  productVariants,
  seo,
} from "../../db/schema";
import { fullVariantValuesCTE } from "../common/cte";
import type { Pagination } from "../common/types";
import { withTx } from "../common/transaction";
import { type NewOption } from "./options";
import { _productVariants } from "./product-variants";

type NewProduct = typeof products.$inferInsert;
type NewProductOption = Omit<
  typeof productOptions.$inferInsert,
  "productId"
> & {
  values: NewProductOptionValue[];
};
type NewProductOptionValue = Omit<
  typeof productOptionValues.$inferInsert,
  "productOptionId"
> & {
  id: number;
};
type NewProductVariant = Omit<
  typeof productVariants.$inferInsert,
  "productId"
> & {
  optionValues: Record<string, { id: number; value: string }>;
  stock: number;
};
type NewSeo = Omit<typeof seo.$inferInsert, "productId">;
type UpdateInventoryItem = Omit<NewInventoryItem, "productId"> & {
  id: number;
};
type UpdateSeo = Partial<NewSeo>;
type UpdateProduct = Partial<
  NewProduct & {
    media: number[];
    seo: UpdateSeo;
    attributeIds: number[];
    inventory: UpdateInventoryItem;
  }
>;
type NewInventoryItem = typeof inventoryItems.$inferInsert;

type ProductsFilter = {
  title: string;
  brands: number[];
  categories: number[];
};

/** Live products matching the list's search and filters. */
async function getListWhere(filters?: Partial<ProductsFilter>) {
  const whereClause = [eq(products.archived, false)];
  if (filters?.title) {
    whereClause.push(ilike(products.title, `%${filters.title}%`));
  }
  if (filters?.brands) {
    whereClause.push(inArray(products.brandId, filters.brands));
  }
  if (filters?.categories) {
    const categoriesIds = new Set<number>([...filters.categories]);
    await Promise.all(
      filters.categories.map(async (categoryId) => {
        const childrenCategoriesIdsQuery = sql<{ id: number }[]>`
            WITH RECURSIVE all_children_categories AS (
              SELECT id
              FROM categories
              WHERE parent_id = ${categoryId}

              UNION ALL

              SELECT categories.id
              FROM categories
              INNER JOIN all_children_categories
                ON all_children_categories.id = categories.parent_id
            )

            SELECT id FROM all_children_categories
          `;

        return db
          .execute<{ id: number }>(childrenCategoriesIdsQuery)
          .then((result) =>
            result.forEach((row) => {
              categoriesIds.add(row.id);
            }),
          );
      }),
    );

    whereClause.push(inArray(products.categoryId, Array.from(categoriesIds)));
  }

  return whereClause;
}

function findListRows({
  where,
  orderBy,
  limit,
}: {
  where: SQL | undefined;
  orderBy: SQL | AnyColumn;
  limit?: number;
}) {
  return db.query.products.findMany({
    where,
    columns: {
      id: true,
      title: true,
      slug: true,
      published: true,
      pinnedPosition: true,
      price: true,
    },

    with: {
      thumbnail: {
        columns: {
          url: true,
        },
      },

      brand: {
        columns: {
          name: true,
        },
        with: {
          logo: {
            columns: {
              url: true,
            },
          },
        },
      },

      category: {
        columns: {
          id: true,
          name: true,
          icon: true,
        },
        with: {
          parent: {
            columns: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      },
    },

    limit,
    orderBy,
  });
}

export const _products = {
  queries: {
    /** Unpinned products in id order; the pinned ones lead the list from `getPinned`. */
    getPage: async ({
      cursor,
      pageSize,
      filters,
    }: Pagination<ProductsFilter>) => {
      return findListRows({
        where: and(
          gt(products.id, cursor ?? 0),
          isNull(products.pinnedPosition),
          ...(await getListWhere(filters)),
        ),
        orderBy: products.id,
        limit: pageSize + 1,
      });
    },

    /** Pinned products, top first. There are only ever a few, so no paging. */
    getPinned: async (filters?: Partial<ProductsFilter>) => {
      return findListRows({
        where: and(
          isNotNull(products.pinnedPosition),
          ...(await getListWhere(filters)),
        ),
        orderBy: products.pinnedPosition,
      });
    },

    findById: async (id: number) => {
      const productMediaQuery = db
        .select({
          productId: productsMedia.productId,
          json: sql<{ mediaId: number; url: string }[]>`
            jsonb_agg(
              jsonb_build_object('mediaId', ${media.id}, 'url', ${media.url})
              order by ${productsMedia.order}, ${productsMedia.id}
            )
          `.as("product_media_json"),
        })
        .from(productsMedia)
        .innerJoin(media, eq(media.id, productsMedia.mediaId))
        .groupBy(productsMedia.productId)
        .as("product_media_query");

      const productAttributesQuery = db
        .select({
          productId: productAttributeValues.productId,
          json: sql<number[]>`
            jsonb_agg(${productAttributeValues.attributeValueId})
          `.as("product_attribute_values_json"),
        })
        .from(productAttributeValues)
        .groupBy(productAttributeValues.productId)
        .as("product_attribute_values_query");

      const nonArchivedOptionValues = db.$with("non_archived_option_values").as(
        db
          .selectDistinct({
            valueId: productOptionValues.id,
            value: productOptionValues.value,
            productOptionId: productOptionValues.productOptionId,
          })
          .from(productOptionValues)
          .innerJoin(
            productOptionValuesVariants,
            eq(
              productOptionValuesVariants.productOptionValueId,
              productOptionValues.id,
            ),
          )
          .innerJoin(
            productVariants,
            and(
              eq(
                productVariants.id,
                productOptionValuesVariants.productVariantId,
              ),
              eq(productVariants.archived, false),
            ),
          ),
      );

      const optionsQuery = db
        .with(nonArchivedOptionValues)
        .select({
          productId: productOptions.productId,
          options: sql<
            {
              id: number;
              name: string;
              values: { id: number; value: string }[];
            }[]
          >`
            jsonb_agg(
              jsonb_build_object(
                'id', ${productOptions.id},
                'name', ${productOptions.name},
                'values', coalesce(
                  (
                    select
                      jsonb_agg(
                        jsonb_build_object(
                          'id', ${nonArchivedOptionValues.valueId},
                          'value', ${nonArchivedOptionValues.value}
                        )
                      )
                    from ${nonArchivedOptionValues}
                    where
                      "product_options"."id" = "product_option_id"
                  ),
                  '[]'::jsonb
                )
              )
            )
          `.as("options"), // the where clause had to be hard coded for some reason
          // the generated query was ambiguous. it was mixing the value id with the product option id
        })
        .from(productOptions)
        .groupBy(productOptions.productId)
        .as("product_options_json");

      type Variant = {
        id: number;
        overridePrice: number | null;
        thumbnail: {
          id: number;
          url: string;
        };
        stock: number;
        optionValues: Record<
          string,
          {
            id: number;
            value: string;
          }
        >;
      };

      const fullVariantQuery = db
        .with(fullVariantValuesCTE)
        .select({
          productId: productVariants.productId,
          json: sql<Variant[]>`jsonb_agg(
              jsonb_build_object(
                'id', ${productVariants.id},
                'overridePrice', ${productVariants.overridePrice},
                'thumbnail', jsonb_build_object(
                  'id', ${media.id},
                  'url', ${media.url}
                ),
                'stock', ${inventoryItems.quantity},
                'optionValues', ${fullVariantValuesCTE.options}
              )
            )`.as("variants_json"),
        })
        .from(productVariants)
        .leftJoin(
          fullVariantValuesCTE,
          eq(fullVariantValuesCTE.id, productVariants.id),
        )
        .leftJoin(
          inventoryItems,
          and(
            eq(inventoryItems.productVariantId, productVariants.id),
            eq(inventoryItems.productId, productVariants.productId),
          ),
        )
        .leftJoin(media, eq(productVariants.thumbnailMediaId, media.id))
        .where(eq(productVariants.archived, false))
        .groupBy(productVariants.productId)
        .as("full_variant_query");

      return db
        .select({
          id: products.id,
          brandId: products.brandId,
          categoryId: products.categoryId,

          title: products.title,
          description: products.description,
          summary: products.summary,
          slug: products.slug,
          published: products.published,
          condition: products.condition,
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          profit: products.profit,
          margin: products.margin,

          seo: {
            pageTitle: seo.pageTitle,
            urlHandler: seo.urlHandler,
            metaDescription: seo.metaDescription,
          },

          inventory: {
            id: inventoryItems.id,
            quantity: inventoryItems.quantity,
          },

          variants: sql<
            Variant[]
          >`coalesce(${fullVariantQuery.json}, '[]'::jsonb)`,
          options: sql<
            {
              id: number;
              name: string;
              values: { id: number; value: string }[];
            }[]
          >`coalesce(${optionsQuery.options}, '[]'::jsonb)`,

          thumbnail: {
            mediaId: media.id,
            url: media.url,
          },
          media: sql<
            { mediaId: number; url: string }[]
          >`coalesce(${productMediaQuery.json}, '[]'::jsonb)`,

          attributeIds: sql<
            number[]
          >`coalesce(${productAttributesQuery.json}, '[]'::jsonb)`,
        })
        .from(products)
        .leftJoin(
          productMediaQuery,
          eq(productMediaQuery.productId, products.id),
        )
        .innerJoin(media, eq(media.id, products.thumbnailMediaId))
        .leftJoin(
          productAttributesQuery,
          eq(productAttributesQuery.productId, products.id),
        )
        .leftJoin(optionsQuery, eq(optionsQuery.productId, products.id))
        .leftJoin(fullVariantQuery, eq(fullVariantQuery.productId, products.id))
        .leftJoin(seo, eq(seo.productId, products.id))
        .leftJoin(
          inventoryItems,
          and(
            eq(inventoryItems.productId, products.id),
            isNull(inventoryItems.productVariantId),
          ),
        )
        .where(eq(products.id, id))
        .limit(1)
        .then((rows) => rows[0]);
    },

    findBySlug: async (
      slug: string,
      { includeArchived = false }: { includeArchived?: boolean } = {},
    ) => {
      return db
        .select({
          id: products.id,
          archived: products.archived,
        })
        .from(products)
        .where(
          includeArchived
            ? eq(products.slug, slug)
            : and(eq(products.slug, slug), eq(products.archived, false)),
        )
        .limit(1)
        .then((rows) => rows[0]);
    },

    getVariants: async (id: number, tx?: Tx) => {
      const variants = await (tx ?? db).query.productVariants.findMany({
        where: eq(productVariants.productId, id),
        columns: {
          id: true,
          overridePrice: true,
        },
        with: {
          optionValues: {
            columns: {},
            with: {
              optionValue: {
                columns: {
                  id: true,
                  value: true,
                },
                with: {
                  option: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
          },

          stock: {
            columns: {
              quantity: true,
            },
          },

          thumbnail: {
            columns: {
              id: true,
              url: true,
            },
          },
        },
      });

      return variants.map((v) => ({
        ...v,
        overridePrice: v.overridePrice ?? 0,
        stock: v.stock?.quantity ?? 0,
        optionValues: Object.fromEntries(
          v.optionValues.map((ov) => [
            ov.optionValue.option.name,
            {
              id: ov.optionValue.id,
              value: ov.optionValue.value,
            },
          ]),
        ),
      }));
    },

    /** Units, orders and revenue from orders that weren't cancelled or refunded. */
    getSalesStats: async (id: number) => {
      return db
        .select({
          orders: sql<number>`count(distinct ${orderItems.orderId})::int`,
          unitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
          // the price saved on the line, or today's price for lines from before prices were saved
          revenue: sql<number>`coalesce(sum(${orderItems.quantity} * coalesce(${orderItems.unitPrice}, ${productVariants.overridePrice}, ${products.price})), 0)::int`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .where(
          and(
            eq(orderItems.productId, id),
            inArray(orders.status, ["PENDING", "SHIPPED", "DELIVERED"]),
          ),
        )
        .then(([row]) => row ?? { orders: 0, unitsSold: 0, revenue: 0 });
    },
  },

  mutations: {
    async createDeep({
      newProduct,
      newProdcutMediaIds,
      newAttributes,
      newProductOptions,
      newVariants,
      newSeo,
      newInventoryItem,
    }: {
      newProduct: NewProduct;
      newProdcutMediaIds: number[];
      newAttributes?: number[];
      newProductOptions?: NewProductOption[];
      newVariants?: NewProductVariant[];
      newSeo?: NewSeo;
      newInventoryItem?: Omit<NewInventoryItem, "productId">;
    }) {
      return db.transaction(async (tx) => {
        const [product] = await tx
          .insert(products)
          .values(newProduct)
          .returning({ id: products.id });

        if (!product) {
          throw new Error("Failed to create product");
        }

        // create the inventory item
        if (newInventoryItem) {
          const [inventoryItem] = await tx
            .insert(inventoryItems)
            .values({
              productId: product.id,
              ...newInventoryItem,
            })
            .returning({ id: inventoryItems.id });

          if (!inventoryItem) {
            throw new Error("Failed to create inventory item");
          }
        }

        const { id: productId } = product;

        // create product media relations
        if (newProdcutMediaIds.length > 0) {
          await tx.insert(productsMedia).values(
            newProdcutMediaIds.map((mediaId, index) => ({
              productId,
              mediaId,
              order: index + 1,
            })),
          );
        }

        // link attributes
        if (newAttributes && newAttributes.length !== 0) {
          await tx.insert(productAttributeValues).values(
            newAttributes.map((id) => ({
              productId,
              attributeValueId: id,
            })),
          );
        }

        // update/insert new options
        if (
          newProductOptions &&
          newProductOptions.length > 0 &&
          newVariants &&
          newVariants.length > 0
        ) {
          const { valuesIdToDbId } =
            await _products.mutations.helpers.upsertManyOptions(
              newProductOptions?.map((o, index) => ({
                name: o.name,
                values: o.values.map((v, index) => ({
                  ...v,
                  order: index + 1,
                })),
                order: index + 1,
                productId,
              })),
              tx,
            );

          const variantsToInsert = newVariants?.map((v) => ({
            ...v,
            thumbnailMediaId: v.thumbnailMediaId,
            optionValues: v.optionValues,
            stock: v.stock,
          }));

          await _productVariants.mutations.helpers.upsertManyTx(
            tx,
            productId,
            variantsToInsert,
            [],
            valuesIdToDbId,
          );
        }

        // create a SEO record for this product
        if (newSeo?.pageTitle && newSeo.urlHandler && newSeo.metaDescription) {
          await tx.insert(seo).values({
            ...newSeo,
            productId,
          });
        }

        return product;
      });
    },

    async update(productId: number, updatedData: UpdateProduct, tx?: Tx) {
      return withTx(tx, async (tx) => {
        const {
          media: mediaData,
          seo: seoData,
          inventory: inventoryData,
          attributeIds,
          ...product
        } = updatedData;

        if (Object.keys(product).length > 0) {
          await tx
            .update(products)
            .set({ ...product })
            .where(eq(products.id, productId))
            .returning({ id: products.id });
        }

        if (mediaData && mediaData.length > 0) {
          const [thumbnailId, ...restMediaIds] = mediaData;

          // delete the old media relations
          await tx
            .delete(productsMedia)
            .where(eq(productsMedia.productId, productId));

          // create the new media relations (excluding thumbnail)
          if (restMediaIds.length > 0) {
            await tx.insert(productsMedia).values(
              restMediaIds.map((mediaId, index) => ({
                productId,
                mediaId,
                order: index + 1,
              })),
            );
          }

          // update the product's thumbnail to be the first media item
          await tx
            .update(products)
            .set({ thumbnailMediaId: thumbnailId })
            .where(eq(products.id, productId));
        }

        // an empty array means every attribute was removed
        if (attributeIds) {
          // delete the old attribute values relations
          await tx
            .delete(productAttributeValues)
            .where(eq(productAttributeValues.productId, productId));

          // create the new attribute values relations
          if (attributeIds.length > 0) {
            await tx.insert(productAttributeValues).values(
              attributeIds.map((attributeValueId) => ({
                productId,
                attributeValueId,
              })),
            );
          }
        }

        if (inventoryData) {
          await tx
            .update(inventoryItems)
            .set({ quantity: inventoryData.quantity })
            .where(
              and(
                eq(inventoryItems.productId, productId),
                eq(inventoryItems.id, inventoryData.id),
              ),
            );
        }

        if (seoData) {
          await tx.update(seo).set(seoData).where(eq(seo.productId, productId));
        }
      });
    },

    delete(productId: number) {
      return db.transaction(async (tx) => {
        const variantRows = await tx
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(eq(productVariants.productId, productId));

        // check if any variants are linked to an order
        const items = await tx
          .select({ id: orderItems.productVariantId })
          .from(orderItems)
          .where(
            inArray(
              orderItems.productVariantId,
              variantRows.map((v) => v.id),
            ),
          );

        if (items.length > 0) {
          await tx
            .update(productVariants)
            .set({ archived: true })
            .where(
              inArray(
                productVariants.id,
                variantRows.map((v) => v.id),
              ),
            );

          const variantsToDeleteIds = Array.from(
            new Set(
              variantRows.filter((v) => !items.some((i) => i.id === v.id)),
            ),
          );

          if (variantsToDeleteIds.length > 0) {
            await tx.delete(productVariants).where(
              inArray(
                productVariants.id,
                variantsToDeleteIds.map((v) => v.id),
              ),
            );
          }
        }

        // check if the product is in any orders
        const productItems = await tx
          .select({ id: orderItems.productId })
          .from(orderItems)
          .where(eq(orderItems.productId, productId));

        const product = tx
          .update(products)
          .set({ archived: true, pinnedPosition: null })
          .where(eq(products.id, productId))
          .returning({ id: products.id })
          .then(([product]) => product);

        return productItems.length === 0
          ? tx
              .delete(products)
              .where(eq(products.id, productId))
              .returning({ id: products.id })
              .then(([product]) => product)
          : product;
      });
    },

    /**
     * Rewrites the pinned order, top first. `reorder` gets the current order
     * and returns the new one, under a lock so two admins pinning at once
     * can't drop each other's pin. Every id it returns must be a live product.
     */
    rewritePinned(reorder: (pinnedIds: number[]) => number[]) {
      return db.transaction(async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext('products.pinned_position'))`,
        );
        const pinnedIds = await tx
          .select({ id: products.id })
          .from(products)
          .where(isNotNull(products.pinnedPosition))
          .orderBy(asc(products.pinnedPosition))
          .then((rows) => rows.map((row) => row.id));
        const ids = reorder(pinnedIds);

        // pinning doesn't change the product page, so the sitemap's lastModified stays put
        const updatedAt = sql`${products.updatedAt}`;
        // positions are unique and checked row by row, so clear them before writing the new ones
        await tx
          .update(products)
          .set({ pinnedPosition: null, updatedAt })
          .where(isNotNull(products.pinnedPosition));
        if (ids.length === 0) return ids;

        const pinned = await tx
          .update(products)
          .set({
            pinnedPosition: sql`case ${products.id} ${sql.join(
              ids.map((id, index) => sql`when ${id} then ${index}::integer`),
              sql` `,
            )} end`,
            updatedAt,
          })
          .where(and(inArray(products.id, ids), eq(products.archived, false)))
          .returning({ id: products.id });
        if (pinned.length !== ids.length) {
          throw new AppError("Product not found", "NOT_FOUND");
        }

        return ids;
      });
    },

    helpers: {
      async upsertManyOptions(data: NewOption[], tx: Tx) {
        const valuesIdToDbId = new Map<number, number>();

        const newOptions = [];

        for (const item of data) {
          const [newOption] = await tx
            .insert(productOptions)
            .values({ productId: item.productId, name: item.name })
            .onConflictDoUpdate({
              target: [productOptions.productId, productOptions.name],
              set: { name: item.name, order: item.order },
            })
            .returning({ id: productOptions.id });

          if (!newOption) {
            throw new Error("Failed to create product option");
          }

          // create/update option values
          for (const value of item.values) {
            const [newOptionValue] = await tx
              .insert(productOptionValues)
              .values({ value: value.value, productOptionId: newOption.id })
              .onConflictDoUpdate({
                target: [
                  productOptionValues.productOptionId,
                  productOptionValues.value,
                ],
                set: { value: value.value, order: value.order },
              })
              .returning({ id: productOptionValues.id });

            if (!newOptionValue) {
              throw new Error("Failed to create product option value");
            }

            valuesIdToDbId.set(value.id, newOptionValue.id);
          }

          newOptions.push({ ...newOption, values: item.values });
        }

        return { newOptions, valuesIdToDbId };
      },
    },
  },
};
