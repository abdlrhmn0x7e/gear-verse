import { and, asc, eq, gt, ilike } from "drizzle-orm";
import { db } from "../db";
import { listingProducts } from "../db/schema/listing-products";
import { listings } from "../db/schema/listings";
import { media } from "../db/schema/media";
import { generateSlug } from "~/lib/utils/slugs";

type NewListing = Omit<typeof listings.$inferInsert, "slug">;
type UpdateListing = Partial<NewListing>;

export const _listingsRepository = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
      filters,
    }: {
      cursor: number | undefined;
      pageSize: number;
      filters?: {
        title?: string;
      };
    }) => {
      const whereClause = [gt(listings.id, cursor ?? 0)];
      if (filters?.title) {
        whereClause.push(ilike(listings.title, `%${filters.title}%`));
      }

      return db
        .select({
          id: listings.id,
          title: listings.title,
          summary: listings.summary,
          slug: listings.slug,
          price: listings.price,
          stock: listings.stock,
          createdAt: listings.createdAt,
          thumbnail: {
            id: media.id,
            url: media.url,
          },
        })
        .from(listings)
        .limit(pageSize + 1)
        .leftJoin(
          media,
          and(
            eq(listings.thumbnailMediaId, media.id),
            eq(media.ownerType, "LISTING"),
          ),
        )
        .orderBy(asc(listings.id))
        .where(and(...whereClause));
    },

    findById: async (id: number) => {
      const listingData = await db.query.listings.findFirst({
        where: eq(listings.id, id),
        columns: {
          id: true,
          title: true,
          summary: true,
          description: true,
          price: true,
          stock: true,
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
          products: {
            columns: {},
            with: {
              product: {
                columns: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!listingData) {
        return;
      }

      return {
        ...listingData,
        products: listingData.products.map((product) => product.product),
      };
    },

    findFullById: async (id: number) => {
      const listingData = await db.query.listings.findFirst({
        where: eq(listings.id, id),
        columns: {
          id: true,
          title: true,
          description: true,
          summary: true,
          price: true,
          stock: true,
          createdAt: true,
        },
        with: {
          thumbnail: {
            columns: {
              id: true,
              url: true,
            },
          },
          products: {
            columns: {},
            with: {
              product: {
                columns: {
                  id: true,
                  title: true,
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
              },
            },
          },
        },
      });

      if (!listingData) {
        return;
      }

      return {
        ...listingData,
        products: listingData.products.map((product) => product.product),
      };
    },
  },
  mutations: {
    create: async (data: NewListing, products: number[]) => {
      return db.transaction(async (tx) => {
        const slug = generateSlug(data.title);
        const [listing] = await tx
          .insert(listings)
          .values({ ...data, slug })
          .returning({ id: listings.id });

        if (!listing) {
          throw new Error("Listing not found");
        }

        /**
         * Take ownership of thumbnail if it is provided
         * because it is uploaded by the user before the listing is created
         */
        if (data.thumbnailMediaId) {
          await tx
            .update(media)
            .set({
              ownerId: listing.id,
              ownerType: "LISTING",
            })
            .where(eq(media.id, data.thumbnailMediaId));
        }

        // link products to listing
        await tx.insert(listingProducts).values(
          products.map((productId) => ({
            listingId: listing.id,
            productId,
          })),
        );

        return listing;
      });
    },

    update: async (id: number, data: UpdateListing, products: number[]) => {
      if (products.length === 0) {
        throw new Error("Products are required");
      }

      return db.transaction(async (tx) => {
        await tx.update(listings).set(data).where(eq(listings.id, id));

        // Delete old products, cause I'm too lazy to diff them
        await tx
          .delete(listingProducts)
          .where(eq(listingProducts.listingId, id));
        await tx.insert(listingProducts).values(
          products.map((productId) => ({
            listingId: id,
            productId,
          })),
        );
      });
    },

    delete: async (id: number) => {
      return db.transaction(async (tx) => {
        await tx
          .delete(listingProducts)
          .where(eq(listingProducts.listingId, id));
        const deletedListing = await tx
          .delete(listings)
          .where(eq(listings.id, id))
          .returning({ id: listings.id })
          .then(([listing]) => listing);
        await tx.delete(media).where(eq(media.ownerId, id));

        return deletedListing;
      });
    },
  },
};
