import { eq } from "drizzle-orm";
import { db } from "../db";
import { listingProducts } from "../db/schema/listing-products";
import { listings } from "../db/schema/listings";
import { media } from "../db/schema/media";

type NewListing = typeof listings.$inferInsert;

export const _listingRepository = {
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
