import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db";
import { media, productVariants } from "../../db/schema";

type InsertProductVariant = typeof productVariants.$inferInsert;
type UpdateProductVariant = Partial<InsertProductVariant>;

export const _adminProductVariantsRepository = {
  mutations: {
    create: (input: InsertProductVariant) => {
      return db.transaction(async (tx) => {
        const [productVariant] = await tx
          .insert(productVariants)
          .values(input)
          .returning({
            id: productVariants.id,
            thumbnailMediaId: productVariants.thumbnailMediaId,
          });

        if (!productVariant) {
          return;
        }

        /**
         * Take ownership of the thumbnail
         */
        if (productVariant.thumbnailMediaId) {
          await tx
            .update(media)
            .set({
              ownerType: "PRODUCT_VARIANT",
              ownerId: productVariant.id,
            })
            .where(eq(media.id, productVariant.thumbnailMediaId));
        }

        return productVariant;
      });
    },

    bulkCreate: async (input: InsertProductVariant[]) => {
      return db.transaction(async (tx) => {
        const newProductVariants = await tx
          .insert(productVariants)
          .values(input)
          .returning({
            id: productVariants.id,
            thumbnailMediaId: productVariants.thumbnailMediaId,
          });

        if (!productVariants) {
          throw new Error("Failed to create product variants");
        }

        for (const v of newProductVariants) {
          if (!v.thumbnailMediaId) {
            continue;
          }

          await tx
            .update(media)
            .set({ ownerId: v.id, ownerType: "PRODUCT_VARIANT" })
            .where(eq(media.id, v.thumbnailMediaId));
        }

        return productVariants;
      });
    },

    update: async (id: number, input: UpdateProductVariant) => {
      const productVariant = await db
        .update(productVariants)
        .set(input)
        .where(eq(productVariants.id, id))
        .returning({ id: productVariants.id });

      if (!productVariant) {
        return;
      }

      return productVariant;
    },

    bulkUpdate: async (variants: (UpdateProductVariant & { id: number })[]) => {
      const productId = variants[0]?.productId;
      if (!productId) {
        throw new Error("Product ID Must be provided in each variant");
      }

      const hasDiffProductIds = variants.some((v) => v.productId !== productId);
      if (hasDiffProductIds) {
        throw new Error("Product IDs must be the same");
      }

      return db.transaction(async (tx) => {
        const existingVariants = await tx
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, productId));

        const existingVariantsMap = new Map(
          existingVariants.map((v) => [v.id, v]),
        );
        const incomingIds = new Set<number>();
        const toUpdate: (UpdateProductVariant & { id: number })[] = [];

        // diff the variants
        for (const v of variants) {
          const { id, ...data } = v;
          incomingIds.add(id);
          if (!existingVariantsMap.has(id)) {
            continue;
          }

          toUpdate.push({ id, ...data });
        }

        const toDelete = existingVariants
          .map((v) => v.id)
          .filter((id) => !incomingIds.has(id));

        // Delete old variants
        await tx
          .delete(productVariants)
          .where(inArray(productVariants.id, toDelete));
        await tx
          .delete(media)
          .where(
            and(
              inArray(media.ownerId, toDelete),
              eq(media.ownerType, "PRODUCT_VARIANT"),
            ),
          ); // delete all media associated with the variants

        // Update existing variants
        for (const v of toUpdate) {
          const { id, ...data } = v;
          await tx
            .update(productVariants)
            .set(data)
            .where(eq(productVariants.id, id));
        }
      });
    },

    delete: async (id: number) => {
      const productVariant = await db
        .delete(productVariants)
        .where(eq(productVariants.id, id))
        .returning({ id: productVariants.id });

      if (!productVariant) {
        return;
      }

      return productVariant;
    },
  },
};
