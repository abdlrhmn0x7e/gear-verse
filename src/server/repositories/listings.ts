import { and, asc, eq, gt, ilike } from "drizzle-orm";
import { db } from "../db";
import { listingProducts } from "../db/schema/listing-products";
import { listings } from "../db/schema/listings";
import { media } from "../db/schema/media";

type NewListing = typeof listings.$inferInsert;

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
      const where = [gt(listings.id, cursor ?? 0)];
      if (filters?.title) {
        where.push(ilike(listings.title, `%${filters.title}%`));
      }

      return db
        .select({
          id: listings.id,
          title: listings.title,
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
        .leftJoin(media, eq(listings.thumbnailMediaId, media.id))
        .orderBy(asc(listings.id))
        .where(and(...where));
    },

    findById: async (id: number) => {
      const listingData = await db.query.listings.findFirst({
        where: eq(listings.id, id),
        columns: {
          id: true,
          title: true,
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
                  images: {
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
                },
              },
            },
          },
        },
      });

      return {
        ...listingData,
        products: listingData?.products.map((product) => product.product),
      };
    },
  },
  mutations: {
    create: async (data: NewListing, products: number[]) => {
      return db.transaction(async (tx) => {
        const [listing] = await tx
          .insert(listings)
          .values(data)
          .returning({ id: listings.id });

        if (!listing) {
          throw new Error("Listing not found");
        }

        /**
         * Take ownership of thumbnail
         * because it is uploaded by the user before the listing is created
         */
        await tx
          .update(media)
          .set({
            ownerId: listing.id,
            ownerType: "LISTING",
          })
          .where(eq(media.id, data.thumbnailMediaId));

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
  },
};
