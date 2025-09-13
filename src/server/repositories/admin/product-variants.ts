import { and, eq, inArray } from "drizzle-orm";
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
          const [updatedMedia] = await tx
            .update(media)
            .set({
              ownerType: "PRODUCT_VARIANT",
              ownerId: productVariant.id,
            })
            .where(eq(media.id, productVariant.thumbnailMediaId))
            .returning({ id: media.id });

          if (!updatedMedia) {
            throw new Error("Failed to update media");
          }
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

        if (!newProductVariants) {
          throw new Error("Failed to create product variants");
        }

        for (const v of newProductVariants) {
          if (!v.thumbnailMediaId) {
            continue;
          }

          const [updatedMedia] = await tx
            .update(media)
            .set({ ownerId: v.id, ownerType: "PRODUCT_VARIANT" })
            .where(eq(media.id, v.thumbnailMediaId))
            .returning({ id: media.id });

          if (!updatedMedia) {
            throw new Error("Failed to update media");
          }
        }

        return newProductVariants;
      });
    },

    update: async (
      id: number,
      oldThumbnailMediaId: number | null,
      input: UpdateProductVariant,
    ) => {
      return db.transaction(async (tx) => {
        const [productVariant] = await tx
          .update(productVariants)
          .set(input)
          .where(eq(productVariants.id, id))
          .returning({
            id: productVariants.id,
            thumbnailMediaId: productVariants.thumbnailMediaId,
          });

        if (!productVariant) {
          return;
        }

        const newThumbnailMediaId = productVariant.thumbnailMediaId;
        if (
          oldThumbnailMediaId &&
          oldThumbnailMediaId !== productVariant.thumbnailMediaId
        ) {
          // Delete the old thumbnail
          await tx.delete(media).where(eq(media.id, oldThumbnailMediaId));
        }

        if (newThumbnailMediaId) {
          // Take ownership of the new thumbnail
          await tx
            .update(media)
            .set({ ownerId: productVariant.id, ownerType: "PRODUCT_VARIANT" })
            .where(eq(media.id, newThumbnailMediaId));
        }

        return productVariant;
      });
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

        // Delete old variants and their media if any
        if (toDelete.length > 0) {
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
            );
        }

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
      return db.transaction(async (tx) => {
        await tx
          .delete(media)
          .where(
            and(eq(media.ownerType, "PRODUCT_VARIANT"), eq(media.ownerId, id)),
          );

        const [deleted] = await tx
          .delete(productVariants)
          .where(eq(productVariants.id, id))
          .returning({ id: productVariants.id });

        return deleted;
      });
    },
  },
};
