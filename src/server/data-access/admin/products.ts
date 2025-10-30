import { eq, gt, ilike, and, inArray, sql, isNull, asc } from "drizzle-orm";
import { db } from "../../db";
import {
  media,
  orderItems,
  productOptions,
  productOptionValues,
  productOptionValuesVariants,
  products,
  productsMedia,
  productVariants,
  seo,
} from "../../db/schema";
import { inventoryItems } from "~/server/db/schema/inventory";
import { _productVariants } from "./product-variants";
import { _options } from "./options";
import { fullVariantValuesCTE } from "../common/cte";

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
    inventory: UpdateInventoryItem;
  }
>;
type NewInventoryItem = typeof inventoryItems.$inferInsert;

export const _products = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
      filters,
    }: {
      cursor: number | undefined;
      pageSize: number;
      filters?: {
        title?: string | null;
        brands?: number[] | null;
        categories?: number[] | null;
      };
    }) => {
      const whereClause = [
        gt(products.id, cursor ?? 0),
        eq(products.archived, false),
      ];
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

        whereClause.push(
          inArray(products.categoryId, Array.from(categoriesIds)),
        );
      }

      return db.query.products.findMany({
        where: and(...whereClause),
        columns: {
          id: true,
          title: true,
          slug: true,
          published: true,
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

        limit: pageSize + 1,
        orderBy: products.id,
      });
    },

    findBySlug: async (slug: string) => {
      const productMediaCTE = db.$with("product_media_cte").as(
        db
          .select({
            productId: productsMedia.productId,
            mediaId: media.id,
            url: media.url,
          })
          .from(productsMedia)
          .leftJoin(media, eq(media.id, productsMedia.mediaId))
          .orderBy(asc(productsMedia.order)),
      );

      const productMediaQuery = db
        .with(productMediaCTE)
        .select({
          productId: productMediaCTE.productId,
          json: sql<{ mediaId: number; url: string }[]>`
            jsonb_agg(
              jsonb_build_object(
                'mediaId', ${productMediaCTE.mediaId},
                'url', ${productMediaCTE.url}
              )
            )
          `.as("product_media_json"),
        })
        .from(productMediaCTE)
        .groupBy(productMediaCTE.productId)
        .as("product_media_query");

      const optionsCTE = db.$with("options_cte").as(
        db
          .select({
            id: productOptions.id,
            productId: productOptions.productId,
            name: productOptions.name,
            values: sql<{ id: number; value: string }[]>`
              jsonb_agg(
                jsonb_build_object(
                  'id', ${productOptionValues.id},
                  'value', ${productOptionValues.value}
                )
              )
            `.as("option_values"),
          })
          .from(productOptions)
          .leftJoin(
            productOptionValues,
            eq(productOptionValues.productOptionId, productOptions.id),
          )
          .leftJoin(
            productOptionValuesVariants,
            eq(
              productOptionValuesVariants.productOptionValueId,
              productOptionValues.id,
            ),
          )
          .leftJoin(
            productVariants,
            eq(
              productOptionValuesVariants.productVariantId,
              productVariants.id,
            ),
          )
          .where(eq(productVariants.archived, false))
          .groupBy(productOptions.id),
      );

      const optionsQuery = db
        .with(optionsCTE)
        .select({
          productId: optionsCTE.productId,
          json: sql<
            {
              id: number;
              name: string;
              values: { id: number; value: string }[];
            }[]
          >`
            jsonb_agg(
              jsonb_build_object(
                'id', ${optionsCTE.id},
                'name', ${optionsCTE.name},
                'values', ${optionsCTE.values}
              )
            )
          `.as("options_json"),
        })
        .from(optionsCTE)
        .groupBy(optionsCTE.productId)
        .as("options_query");

      const fullVariantQuery = db
        .with(fullVariantValuesCTE)
        .select({
          productId: productVariants.productId,
          json: sql<
            {
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
            }[]
          >`jsonb_agg(
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

          variants: fullVariantQuery.json,
          options: optionsQuery.json,

          media: productMediaQuery.json,
        })
        .from(products)
        .leftJoin(
          productMediaQuery,
          eq(productMediaQuery.productId, products.id),
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
        .where(eq(products.slug, slug))
        .limit(1)
        .then((rows) => rows[0]);
    },

    getVariants: async (id: number) => {
      const variants = await db.query.productVariants.findMany({
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
  },

  mutations: {
    async createDeep({
      newProduct,
      newProdcutMediaIds,
      newProductOptions,
      newVariants,
      newSeo,
      newInventoryItem,
    }: {
      newProduct: NewProduct;
      newProdcutMediaIds: number[];
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
          const [inventoryItem] = await tx.insert(inventoryItems).values({
            productId: product.id,
            ...newInventoryItem,
          });

          if (!inventoryItem) {
            throw new Error("Failed to create inventory item");
          }
        }

        const { id: productId } = product;

        // create product media relations
        await tx.insert(productsMedia).values(
          newProdcutMediaIds.map((mediaId, index) => ({
            productId,
            mediaId,
            order: index + 1,
          })),
        );

        // update/insert new options
        if (
          newProductOptions &&
          newProductOptions.length > 0 &&
          newVariants &&
          newVariants.length > 0
        ) {
          const { valuesIdToDbId } = await _options.mutations.upsertMany(
            newProductOptions?.map((o, index) => ({
              name: o.name,
              values: o.values.map((v, index) => ({
                ...v,
                order: index + 1,
              })),
              order: index + 1,
              productId,
            })),
          );

          const variantsToInsert = newVariants?.map((v) => ({
            ...v,
            thumbnailMediaId: v.thumbnailMediaId,
            optionValues: v.optionValues,
            stock: v.stock,
          }));

          await _productVariants.mutations.upsertMany(
            productId,
            variantsToInsert,
            [],
            valuesIdToDbId,
          );
        }

        // create a SEO record for this product
        if (newSeo) {
          await tx.insert(seo).values({
            ...newSeo,
            productId,
          });
        }

        return product;
      });
    },

    async update(productId: number, updatedData: UpdateProduct) {
      return db.transaction(async (tx) => {
        const {
          media: mediaData,
          seo: seoData,
          inventory: inventoryData,
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
          // delete the old media relations
          await tx
            .delete(productsMedia)
            .where(eq(productsMedia.productId, productId));

          // create the new media relations
          await tx.insert(productsMedia).values(
            mediaData.map((mediaId, index) => ({
              productId,
              mediaId,
              order: index + 1,
            })),
          );

          // update the product's thumbnail to be the first media item
          await tx
            .update(products)
            .set({ thumbnailMediaId: mediaData[0] })
            .where(eq(products.id, productId));
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

          return tx
            .update(products)
            .set({ archived: true })
            .where(eq(products.id, productId))
            .returning({ id: products.id })
            .then(([product]) => product);
        }

        return tx
          .delete(products)
          .where(eq(products.id, productId))
          .returning({ id: products.id })
          .then(([product]) => product);
      });
    },
  },
};
