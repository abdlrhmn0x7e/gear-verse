import { eq, gt, ilike, and, inArray, sql } from "drizzle-orm";
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
import { alias } from "drizzle-orm/pg-core";
import { _productVariants } from "./product-variants";
import { _options } from "./options";

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
type UpdateSeo = Partial<NewSeo>;
type UpdateProduct = Partial<NewProduct & { media: number[]; seo: UpdateSeo }>;

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
          filters.categories.map((categoryId) => {
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

    findById: async (id: number) => {
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

      const productOptionsJson = db
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

      const variantThumbnail = alias(media, "variant_thumbnail");
      const variantInventory = alias(inventoryItems, "variant_inventory");
      const productInventory = alias(inventoryItems, "product_inventory");
      const variantsQuery = db
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          overridePrice: productVariants.overridePrice,
          thumbnail: {
            id: sql<number>`${variantThumbnail.id}`.as("thumbnailId"),
            url: variantThumbnail.url,
          },
          stock:
            sql<number>`coalesce(${variantInventory.quantity}, ${productInventory.quantity})`.as(
              "stock",
            ),
          optionValues: sql<Record<string, { id: number; value: string }>>`
          jsonb_object_agg(
              ${productOptions.name}, json_build_object(
                'id', ${productOptionValues.id},
                'value', ${productOptionValues.value}
              )
            )
        `.as("option_values"),
        })
        .from(productVariants)
        .leftJoin(
          variantThumbnail,
          eq(productVariants.thumbnailMediaId, variantThumbnail.id),
        )
        .leftJoin(
          variantInventory,
          and(
            eq(productVariants.id, variantInventory.itemId),
            eq(variantInventory.itemType, "VARIANT"),
          ),
        )
        .leftJoin(
          productInventory,
          and(
            eq(productVariants.productId, productInventory.itemId),
            eq(productInventory.itemType, "PRODUCT"),
          ),
        )
        .leftJoin(
          productOptionValuesVariants,
          eq(productOptionValuesVariants.productVariantId, productVariants.id),
        )
        .leftJoin(
          productOptionValues,
          eq(
            productOptionValuesVariants.productOptionValueId,
            productOptionValues.id,
          ),
        )
        .leftJoin(
          productOptions,
          eq(productOptionValues.productOptionId, productOptions.id),
        )
        .groupBy(
          productVariants.id,
          variantThumbnail.id,
          productInventory.quantity,
          variantInventory.quantity,
        )
        .as("product_variants");

      const variantsJson = db
        .select({
          json: sql<
            {
              id: number;
              overridePrice: number;
              thumbnail: { id: number; url: string };
              stock: number;
              optionValues: Record<string, { id: number; value: string }>;
            }[]
          >`
          jsonb_agg(
            jsonb_build_object(
              'id', ${variantsQuery.id},
              'overridePrice', ${variantsQuery.overridePrice},
              'thumbnail', jsonb_build_object(
                'id', ${variantsQuery.thumbnail.id},
                'url', ${variantsQuery.thumbnail.url}
              ),
              'stock', ${variantsQuery.stock},
              'optionValues', ${variantsQuery.optionValues}
            )
          )
        `.as("json"),
        })
        .from(variantsQuery)
        .where(eq(variantsQuery.productId, id))
        .as("variants_json");

      const productMediaQuery = db
        .select({
          mediaId: productsMedia.mediaId,
          url: media.url,
        })
        .from(productsMedia)
        .orderBy(productsMedia.order)
        .leftJoin(media, eq(productsMedia.mediaId, media.id))
        .where(eq(productsMedia.productId, id))
        .as("product_media_query");

      const productMediaJson = db
        .select({
          json: sql<{ mediaId: number; url: string }[]>`
            jsonb_agg(
              jsonb_build_object(
                'mediaId', ${productMediaQuery.mediaId},
                'url', ${productMediaQuery.url}
              )
            )
        `.as("product_media"),
        })
        .from(productMediaQuery)
        .as("product_media_json");

      return db
        .select({
          id: products.id,
          title: products.title,
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          summary: products.summary,
          description: products.description,
          published: products.published,
          categoryId: products.categoryId,
          brandId: products.brandId,
          profit: products.profit,
          margin: products.margin,
          options: productOptionsJson.options,
          variants: variantsJson.json,
          media: productMediaJson.json,
          seo: {
            pageTitle: seo.pageTitle,
            urlHandler: seo.urlHandler,
            metaDescription: seo.metaDescription,
          },
        })
        .from(products)
        .leftJoin(
          productOptionsJson,
          eq(productOptionsJson.productId, products.id),
        )
        .leftJoinLateral(variantsJson, sql`true`)
        .leftJoinLateral(productMediaJson, sql`true`)
        .leftJoin(seo, eq(seo.productId, products.id))
        .where(eq(products.id, id))
        .limit(1)
        .then(([product]) => product);
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

    findBySlug: async (slug: string) => {
      return db.query.products.findFirst({
        where: eq(products.slug, slug),
        columns: {
          id: true,
        },
      });
    },
  },

  mutations: {
    async createDeep({
      newProduct,
      newProdcutMediaIds,
      newProductOptions,
      newVariants,
      newSeo,
    }: {
      newProduct: NewProduct;
      newProdcutMediaIds: number[];
      newProductOptions?: NewProductOption[];
      newVariants?: NewProductVariant[];
      newSeo?: NewSeo;
    }) {
      return db.transaction(async (tx) => {
        const [product] = await tx
          .insert(products)
          .values(newProduct)
          .returning({ id: products.id });

        if (!product) {
          throw new Error("Failed to create product");
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
        const { media: mediaData, seo: seoData, ...product } = updatedData;

        if (Object.keys(product).length > 0) {
          await tx
            .update(products)
            .set(product)
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
