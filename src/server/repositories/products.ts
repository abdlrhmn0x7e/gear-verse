import { eq, gt, ilike, and, inArray, notInArray } from "drizzle-orm";
import { db } from "../db";
import { media, products, productVariants } from "../db/schema";
import { listingProducts } from "../db/schema/listing-products";

type NewProduct = typeof products.$inferInsert;
type UpdateProduct = Partial<NewProduct>;

export const _productsRepository = {
  queries: {
    findAll: async () => {
      return db
        .select({
          id: products.id,
          title: products.title,
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
      };
    }) => {
      const whereClause = [gt(products.id, cursor ?? 0)];
      if (filters?.title) {
        whereClause.push(ilike(products.title, `%${filters.title}%`));
      }
      if (filters?.brands) {
        whereClause.push(inArray(products.brandId, filters.brands));
      }

      return db.query.products.findMany({
        where: and(...whereClause),
        columns: {
          id: true,
          title: true,
          createdAt: true,
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
          variants: {
            columns: {
              id: true,
              name: true,
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
          listings: {
            columns: {},
            with: {
              listing: {
                columns: {
                  id: true,
                  slug: true,
                  title: true,
                  summary: true,
                },
                with: {
                  thumbnail: {
                    columns: {
                      id: true,
                      url: true,
                      ownerType: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!product) {
        return;
      }

      return {
        ...product,
        listings: product.listings.map((listing) => listing.listing),
      };
    },
  },

  mutations: {
    create: async (product: NewProduct) => {
      return db
        .insert(products)
        .values(product)
        .returning({ id: products.id })
        .then(([result]) => result);
    },

    update: async (id: number, product: UpdateProduct) => {
      return db
        .update(products)
        .set(product)
        .where(eq(products.id, id))
        .returning({ id: products.id })
        .then(([result]) => result);
    },

    delete: async (id: number) => {
      return db.transaction(async (tx) => {
        // delete all listings products
        await tx
          .delete(listingProducts)
          .where(eq(listingProducts.productId, id));

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
