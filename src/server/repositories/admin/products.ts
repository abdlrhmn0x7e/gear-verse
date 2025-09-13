import { eq, gt, ilike, and, inArray, notInArray, sql } from "drizzle-orm";
import { db } from "../../db";
import { media, products, productVariants } from "../../db/schema";

type NewProduct = typeof products.$inferInsert;
type UpdateProduct = Partial<NewProduct>;

export const _adminProductsRepository = {
  queries: {
    findAll: async () => {
      return db
        .select({
          id: products.id,
          name: products.name,
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
        name?: string | null;
        brands?: number[] | null;
        categories?: number[] | null;
      };
    }) => {
      const whereClause = [gt(products.id, cursor ?? 0)];
      if (filters?.name) {
        whereClause.push(ilike(products.name, `%${filters.name}%`));
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
          name: true,
          published: true,
        },
        with: {
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

          thumbnail: {
            columns: {
              id: true,
              url: true,
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
          name: true,
          summary: true,
          description: true,
          categoryId: true,
          brandId: true,
          specifications: true,
          thumbnailMediaId: true,

          createdAt: true,
        },
        with: {
          thumbnail: {
            columns: {
              id: true,
              url: true,
              ownerType: true,
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

          variants: {
            columns: {
              id: true,
              name: true,
              stock: true,
              price: true,
              options: true,
            },
            with: {
              thumbnail: {
                columns: {
                  id: true,
                  url: true,
                  ownerType: true,
                },
              },
              images: {
                where: and(
                  eq(media.ownerType, "PRODUCT_VARIANT"),
                  notInArray(
                    media.id,
                    db
                      .select({ id: media.id })
                      .from(productVariants)
                      .leftJoin(
                        media,
                        eq(media.id, productVariants.thumbnailMediaId),
                      ),
                  ),
                ),
                columns: {
                  id: true,
                  url: true,
                  ownerType: true,
                },
              },
            },
          },
        },
      });

      return product;
    },
  },

  mutations: {
    create: async (value: NewProduct) => {
      return db.transaction(async (tx) => {
        const product = await tx
          .insert(products)
          .values(value)
          .returning({
            id: products.id,
            thumbnailMediaId: products.thumbnailMediaId,
          })
          .then(([product]) => product);

        if (!product) {
          return;
        }

        if (product.thumbnailMediaId) {
          await tx
            .update(media)
            .set({ ownerType: "PRODUCT", ownerId: product.id })
            .where(eq(media.id, product.thumbnailMediaId));
        }

        return product;
      });
    },

    update: async (id: number, value: UpdateProduct) => {
      return db
        .update(products)
        .set(value)
        .where(eq(products.id, id))
        .returning({ id: products.id })
        .then(([result]) => result);
    },

    delete: async (id: number) => {
      return db.transaction(async (tx) => {
        // delete all product variants
        await tx
          .delete(productVariants)
          .where(eq(productVariants.productId, id));

        // delete all media
        await tx
          .delete(media)
          .where(and(eq(media.ownerId, id), eq(media.ownerType, "PRODUCT")));

        // delete product
        await tx.delete(products).where(eq(products.id, id));
      });
    },
  },
};
