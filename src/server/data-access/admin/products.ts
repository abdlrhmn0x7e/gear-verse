import { eq, gt, ilike, and, inArray, sql } from "drizzle-orm";
import { db } from "../../db";
import {
  productOptions,
  productOptionValues,
  productOptionValuesVariants,
  products,
  productsMedia,
  productVariants,
  seo,
} from "../../db/schema";
import { inventoryItems } from "~/server/db/schema/inventory";

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
  id: string;
};
type NewProductVariant = Omit<
  typeof productVariants.$inferInsert,
  "productId"
> & {
  optionValues: Record<string, { id: string; value: string }>;
  stock: number;
};
type NewSeo = Omit<typeof seo.$inferInsert, "productId">;

type UpdateProduct = Partial<NewProduct> & {
  id: number;
};
type UpdateProductOption = Partial<NewProductOption> & {
  id: number;
};
type UpdateProductOptionValue = Partial<NewProductOptionValue> & {
  id: string;
};
type UpdateProductVariant = Partial<NewProductVariant> & {
  id: number;
};
type UpdateSeo = Partial<NewSeo> & {
  id: number;
};

export const _adminProductsRepo = {
  queries: {
    findAll: async () => {
      return db
        .select({
          id: products.id,
          title: products.title,
          slug: products.slug,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products);
    },

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
      const whereClause = [gt(products.id, cursor ?? 0)];
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
              name: true,
              icon: true,
            },
            with: {
              parent: {
                columns: {
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
      const product = await db.query.products.findFirst({
        where: eq(products.id, id),
        columns: {
          id: true,
          title: true,
          summary: true,
          description: true,
          price: true,
          margin: true,
          profit: true,
          published: true,
          categoryId: true,
          brandId: true,

          createdAt: true,
        },
        with: {
          seo: {
            columns: {
              id: true,
              pageTitle: true,
              urlHandler: true,
              metaDescription: true,
            },
          },

          thumbnail: {
            columns: {
              id: true,
              url: true,
            },
          },

          brand: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              logo: {
                columns: {
                  id: true,
                  url: true,
                },
              },
            },
          },

          media: {
            columns: {},
            with: {
              media: {
                columns: {
                  id: true,
                  url: true,
                },
              },
            },
          },

          category: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              parent: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          variants: {
            columns: {
              overridePrice: true,
            },
            with: {
              thumbnail: {
                columns: {
                  id: true,
                  url: true,
                },
              },

              optionValues: {
                columns: {},
                with: {
                  optionValue: {
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
            },
          },

          options: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              values: {
                columns: {
                  id: true,
                  value: true,
                },
                orderBy: productOptionValues.order,
              },
            },
          },
        },
      });

      return {
        ...product,
        media: product?.media.map((m) => ({
          mediaId: m.media.id,
          url: m.media.url,
        })),
        variants: product?.variants.map((v) => ({
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
        })),
      };
    },
  },

  mutations: {
    createDeep: async ({
      newProduct,
      newProdcutMediaIds,
      newProductOptions,
      newVariants,
      newSeo,
    }: {
      newProduct: NewProduct;
      newProdcutMediaIds: number[];
      newProductOptions: NewProductOption[];
      newVariants: NewProductVariant[];
      newSeo?: NewSeo;
    }) => {
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

        const valuesCuidToDbId = new Map<string, number>();

        for (const o of newProductOptions) {
          const { values: newOptionValues, ...newOption } = o;

          const [option] = await tx
            .insert(productOptions)
            .values({
              ...newOption,
              productId,
            })
            .returning({ id: productOptions.id, name: productOptions.name });

          if (!option) {
            throw new Error("Failed to create product option");
          }

          const values = await tx
            .insert(productOptionValues)
            .values(
              newOptionValues.map((value, index) => ({
                value: value.value,
                order: index + 1,
                productOptionId: option.id,
              })),
            )
            .returning({ id: productOptionValues.id });

          if (!values || values.length === 0) {
            throw new Error("Failed to create product option values");
          }

          // assuming the ids are the same as the order of the values
          values.forEach((value, index) => {
            valuesCuidToDbId.set(newOptionValues[index]!.id, value.id);
          });
        }

        const variants = await tx
          .insert(productVariants)
          .values(
            newVariants.map((variant) => ({
              ...variant,
              productId,
            })),
          )
          .returning({ id: productVariants.id });

        if (!variants || variants.length === 0) {
          throw new Error("Failed to create product variants");
        }

        // link the option values to the variants
        for (const [index, variant] of variants.entries()) {
          const { optionValues, stock } = newVariants[index]!;

          // link the option values to the variants
          await tx.insert(productOptionValuesVariants).values(
            Object.values(optionValues).map((value) => ({
              productOptionValueId: valuesCuidToDbId.get(value.id)!,
              productVariantId: variant.id,
            })),
          );

          // create an inventory record for this variant
          await tx.insert(inventoryItems).values({
            variantId: variant.id,
            quantity: stock,
          });
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

    editDeep: async ({
      updatedProduct,
      updatedProdcutMediaIds,
      updatedProductOptions,
      updatedVariants,
      updatedSeo,
    }: {
      updatedProduct: UpdateProduct;
      updatedProdcutMediaIds: number[];
      updatedProductOptions: UpdateProductOption[];
      updatedVariants: UpdateProductVariant[];
      updatedSeo?: UpdateSeo;
    }) => {
      return;
    },
  },
};
