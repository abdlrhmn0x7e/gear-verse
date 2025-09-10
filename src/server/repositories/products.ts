import { eq, gt, ilike, and, inArray } from "drizzle-orm";
import { db } from "../db";
import { media, products } from "../db/schema";
import { listingProducts } from "../db/schema/listing-products";

type NewProduct = typeof products.$inferInsert;
type UpdateProduct = Partial<NewProduct>;

export const _productsRepository = {
  queries: {
    findAll() {
      return db
        .select({
          id: products.id,
          title: products.title,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products);
    },

    getPage: ({
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
            with: {
              logo: {
                columns: {
                  id: true,
                  url: true,
                },
              },
            },
          },
          images: {
            columns: {
              id: true,
              url: true,
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
        brand: product.brand,
        images: product.images,
        listings: product.listings.map((listing) => listing.listing),
      };
    },
  },

  mutations: {
    create: (product: NewProduct) => {
      return db
        .insert(products)
        .values(product)
        .returning({ id: products.id })
        .then(([result]) => result);
    },

    update: (id: number, product: UpdateProduct) => {
      return db
        .update(products)
        .set(product)
        .where(eq(products.id, id))
        .returning({ id: products.id })
        .then(([result]) => result);
    },

    delete: (id: number) => {
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
