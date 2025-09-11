import { eq } from "drizzle-orm";
import { db } from "../db";
import { media, productVariants } from "../db/schema";

type InsertProductVariant = typeof productVariants.$inferInsert;

export const _productVariantsRepository = {
  mutations: {
    create: async (input: InsertProductVariant) => {
      const productVariant = await db
        .insert(productVariants)
        .values(input)
        .returning({ id: productVariants.id })
        .then(([productVariant]) => productVariant);

      if (!productVariant) {
        return;
      }

      /**
       * Take ownership of the thumbnail
       */
      await db
        .update(media)
        .set({
          ownerType: "PRODUCT_VARIANT",
          ownerId: productVariant.id,
        })
        .where(eq(media.id, input.thumbnailMediaId));

      return productVariant;
    },
  },
};
