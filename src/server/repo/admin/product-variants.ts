import { and, eq, inArray, gt, ilike } from "drizzle-orm";
import { db } from "../../db";
import { media, variants, products } from "../../db/schema";

type ProductVariantFilters = {
  search?: string | null;
  productId?: number | null;
};

type InsertProductVariant = typeof variants.$inferInsert;
type UpdateProductVariant = Partial<InsertProductVariant>;

export const _adminVariantsRepo = {
  queries: {
    findAll: async () => {
      return db.query.productVariants.findMany({
        columns: {
          id: true,
          name: true,
          stock: true,
          price: true,
        },
        with: {
          product: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: (variants, { asc }) => asc(variants.name),
      });
    },

    getPage: async ({
      cursor,
      pageSize,
      filters,
    }: {
      cursor: number | undefined;
      pageSize: number;
      filters?: ProductVariantFilters;
    }) => {
      const whereClause = [gt(variants.id, cursor ?? 0)];

      if (filters?.search) {
        whereClause.push(ilike(variants.name, `%${filters.search}%`));
      }

      if (filters?.productId) {
        whereClause.push(eq(variants.productId, filters.productId));
      }

      return db
        .select({
          id: variants.id,
          name: variants.name,
          stock: variants.stock,
          price: variants.price,
          thumbnail: {
            url: media.url,
          },
          product: {
            id: products.id,
            name: products.name,
          },
        })
        .from(variants)
        .leftJoin(products, eq(variants.productId, products.id))
        .leftJoin(media, eq(variants.thumbnailMediaId, media.id))
        .where(and(...whereClause))
        .limit(pageSize + 1)
        .orderBy(variants.id);
    },
  },
  mutations: {
    create: (input: InsertProductVariant) => {
      return db.transaction(async (tx) => {
        const [productVariant] = await tx
          .insert(variants)
          .values(input)
          .returning({
            id: variants.id,
            thumbnailMediaId: variants.thumbnailMediaId,
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
          .insert(variants)
          .values(input)
          .returning({
            id: variants.id,
            thumbnailMediaId: variants.thumbnailMediaId,
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
          .update(variants)
          .set(input)
          .where(eq(variants.id, id))
          .returning({
            id: variants.id,
            thumbnailMediaId: variants.thumbnailMediaId,
          });

        if (!productVariant) {
          return;
        }

        const newThumbnailMediaId = productVariant.thumbnailMediaId;

        // Delete the old thumbnail if it changed (CASCADE will handle nullifying the FK)
        if (
          oldThumbnailMediaId &&
          oldThumbnailMediaId !== newThumbnailMediaId
        ) {
          await tx.delete(media).where(eq(media.id, oldThumbnailMediaId));
        }

        // Take ownership of the new thumbnail
        if (newThumbnailMediaId) {
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
          .from(variants)
          .where(eq(variants.productId, productId));

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
          await tx.delete(variants).where(inArray(variants.id, toDelete));
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
          await tx.update(variants).set(data).where(eq(variants.id, id));
        }
      });
    },

    delete: async (id: number) => {
      return db.transaction(async (tx) => {
        // Delete all media owned by this variant (images, etc.) - CASCADE will handle thumbnail nullification
        await tx
          .delete(media)
          .where(
            and(eq(media.ownerType, "PRODUCT_VARIANT"), eq(media.ownerId, id)),
          );

        // Delete the variant first
        const [deleted] = await tx
          .delete(variants)
          .where(eq(variants.id, id))
          .returning({ id: variants.id });

        return deleted;
      });
    },

    bulkDelete: async (ids: number[]) => {
      return db.transaction(async (tx) => {
        // Delete all media owned by these variants (images, etc.) - CASCADE will handle thumbnail nullification
        await tx
          .delete(media)
          .where(
            and(
              eq(media.ownerType, "PRODUCT_VARIANT"),
              inArray(media.ownerId, ids),
            ),
          );

        // Delete variants first
        const deleted = await tx
          .delete(variants)
          .where(inArray(variants.id, ids))
          .returning({ id: variants.id });

        return deleted;
      });
    },
  },
};
