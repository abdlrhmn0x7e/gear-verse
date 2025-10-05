import {
  inventoryItems,
  orderItems,
  productOptions,
  productOptionValues,
  productOptionValuesVariants,
  productVariants,
} from "~/server/db/schema";
import { db, type Tx } from "~/server/db";
import { eq, inArray } from "drizzle-orm";

type NewProductVariant = Omit<
  typeof productVariants.$inferInsert,
  "productId"
> & {
  optionValues: Record<string, { id: number; value: string }>;
  stock: number;
};

export const _adminProductVariants = {
  queries: {},
  mutations: {
    async upsertMany(
      productId: number,

      toInsert: NewProductVariant[],
      toUpdate: (NewProductVariant & { id: number })[],
      valuesIdToDbId: Map<number, number>,
    ) {
      return db.transaction(async (tx) =>
        this.helpers.upsertManyTx(
          tx,
          productId,
          toInsert,
          toUpdate,
          valuesIdToDbId,
        ),
      );
    },

    deleteOrArchiveMany(variantIds: number[]) {
      return db.transaction(async (tx) =>
        this.helpers.deleteOrArchiveManyTx(tx, variantIds),
      );
    },

    recreate({
      productId,
      variantsIds,
      toInsert,
      toUpdate,
      valuesIdToDbId,
    }: {
      productId: number;
      variantsIds: number[];
      toInsert: NewProductVariant[];
      toUpdate: (NewProductVariant & { id: number })[];
      valuesIdToDbId: Map<number, number>;
    }) {
      return db.transaction(async (tx) => {
        // 1) Create the new variants, options, option values, and pivots
        await this.helpers.upsertManyTx(
          tx,
          productId,
          toInsert,
          toUpdate,
          valuesIdToDbId,
        );

        // 2) Delete/archive the old variants, options, option values and pivots
        return this.helpers.deleteOrArchiveManyTx(tx, variantsIds);
      });
    },

    updateMany(
      variants: {
        id: number;
        stock: number;
        thumbnailMediaId: number;
        overridePrice: number | null;
      }[],
    ) {
      return db.transaction(async (tx) => {
        for (const variant of variants) {
          const { id, stock, ...rest } = variant;

          await tx
            .update(productVariants)
            .set(rest)
            .where(eq(productVariants.id, variant.id));

          await tx
            .update(inventoryItems)
            .set({ quantity: stock })
            .where(eq(inventoryItems.variantId, id));
        }
      });
    },

    helpers: {
      async upsertManyTx(
        tx: Tx,
        productId: number,

        toInsert: NewProductVariant[],
        toUpdate: (NewProductVariant & { id: number })[],
        valuesIdToDbId: Map<number, number>,
      ) {
        const newVariants = [];

        // insert new variants
        for (const item of toInsert) {
          const [newVariant] = await tx
            .insert(productVariants)
            .values({
              productId,
              overridePrice: item.overridePrice,
              archived: item.archived,
              thumbnailMediaId: item.thumbnailMediaId,
            })
            .onConflictDoNothing({
              target: productVariants.id,
            })
            .returning({ id: productVariants.id });

          if (!newVariant) {
            throw new Error("Failed to create product variant");
          }

          const newPivots = await tx
            .insert(productOptionValuesVariants)
            .values(
              Object.values(item.optionValues).map((value) => ({
                productOptionValueId: valuesIdToDbId.get(value.id)!,
                productVariantId: newVariant.id,
              })),
            )
            .returning({
              productVariantId: productOptionValuesVariants.productVariantId,
              productOptionValueId:
                productOptionValuesVariants.productOptionValueId,
            });

          if (!newPivots) {
            throw new Error("Failed to create product option values variants");
          }

          await tx
            .insert(inventoryItems)
            .values({ variantId: newVariant.id, quantity: item.stock })
            .onConflictDoUpdate({
              target: inventoryItems.variantId,
              set: { quantity: item.stock },
            });

          newVariants.push({ ...newVariant, optionValues: newPivots });
        }

        // update existing variants
        for (const { id, ...item } of toUpdate) {
          await tx
            .update(productVariants)
            .set({
              overridePrice: item.overridePrice,
              archived: item.archived,
              thumbnailMediaId: item.thumbnailMediaId,
            })
            .where(eq(productVariants.id, id));

          // update the stock
          await tx
            .update(inventoryItems)
            .set({ quantity: item.stock })
            .where(eq(inventoryItems.variantId, id));
        }

        return newVariants;
      },

      async deleteOrArchiveManyTx(tx: Tx, variantIds: number[]) {
        const deletedVariantIds: number[] = [];
        const archivedVariantIds: number[] = [];

        if (variantIds.length === 0) {
          return { deletedVariantIds, archivedVariantIds };
        }

        // 1) Find variants with orders → archive in bulk
        const rowsToArchive = await tx
          .select({ id: orderItems.productVariantId })
          .from(orderItems)
          .where(inArray(orderItems.productVariantId, variantIds));

        const toArchiveIds = Array.from(
          new Set(rowsToArchive.map((r) => r.id)),
        );
        if (toArchiveIds.length > 0) {
          await tx
            .update(productVariants)
            .set({ archived: true })
            .where(inArray(productVariants.id, toArchiveIds));
          archivedVariantIds.push(...toArchiveIds);
        }

        // 2) The rest can be deleted
        const toArchiveSet = new Set(toArchiveIds);
        const toDeleteIds = variantIds.filter((id) => !toArchiveSet.has(id));

        if (toDeleteIds.length > 0) {
          // Collect candidate option value ids BEFORE deleting variants (pivots will cascade)
          const candidateRows = await tx
            .select({
              id: productOptionValuesVariants.productOptionValueId,
            })
            .from(productOptionValuesVariants)
            .where(
              inArray(
                productOptionValuesVariants.productVariantId,
                toDeleteIds,
              ),
            );
          const candidateIds = Array.from(
            new Set(candidateRows.map((r) => r.id)),
          );

          // Bulk delete variants (pivots cascade)
          await tx
            .delete(productVariants)
            .where(inArray(productVariants.id, toDeleteIds));
          deletedVariantIds.push(...toDeleteIds);

          // Delete only option values that are no longer referenced by ANY variant
          if (candidateIds.length > 0) {
            const stillRefRows = await tx
              .select({
                id: productOptionValuesVariants.productOptionValueId,
              })
              .from(productOptionValuesVariants)
              .where(
                inArray(
                  productOptionValuesVariants.productOptionValueId,
                  candidateIds,
                ),
              );

            const stillRefSet = new Set(stillRefRows.map((r) => r.id));
            const toDeleteValueIds = candidateIds.filter(
              (id) => !stillRefSet.has(id),
            );

            if (toDeleteValueIds.length > 0) {
              const deleted = await tx
                .delete(productOptionValues)
                .where(inArray(productOptionValues.id, toDeleteValueIds))
                .returning({ optionId: productOptionValues.productOptionId });

              // if an option has no values left, delete it
              const candidateOptionIds = Array.from(
                new Set(deleted.map((d) => d.optionId)),
              );

              const stillHasValues = await tx
                .select({ optionId: productOptionValues.productOptionId })
                .from(productOptionValues)
                .where(
                  inArray(
                    productOptionValues.productOptionId,
                    candidateOptionIds,
                  ),
                );

              const stillSet = new Set(stillHasValues.map((r) => r.optionId));
              const toDeleteOptionIds = candidateOptionIds.filter(
                (id) => !stillSet.has(id),
              );

              if (toDeleteOptionIds.length > 0) {
                await tx
                  .delete(productOptions)
                  .where(inArray(productOptions.id, toDeleteOptionIds));
              }
            }
          }
        }

        return { deletedVariantIds, archivedVariantIds };
      },
    },
  },
};
