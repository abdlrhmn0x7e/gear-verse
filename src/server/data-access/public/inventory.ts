import { and, eq, isNull } from "drizzle-orm";
import { db } from "~/server/db";
import { inventoryItems } from "~/server/db/schema";

export const _inventory = {
  queries: {
    getItemsStock: async (
      items: { productId: number; productVariantId: number | null }[],
    ) => {
      if (items.length === 0) {
        return [];
      }

      return db.transaction(async (tx) => {
        const itemsStock = [];

        for (const item of items) {
          if (item.productVariantId) {
            const [inventory] = await tx
              .select({ quantity: inventoryItems.quantity })
              .from(inventoryItems)
              .where(
                and(
                  eq(inventoryItems.productId, item.productId),
                  eq(inventoryItems.productVariantId, item.productVariantId),
                ),
              );
            itemsStock.push({ ...item, stock: inventory?.quantity ?? 0 });
          } else {
            const [inventory] = await tx
              .select({ quantity: inventoryItems.quantity })
              .from(inventoryItems)
              .where(
                and(
                  eq(inventoryItems.productId, item.productId),
                  isNull(inventoryItems.productVariantId),
                ),
              );
            itemsStock.push({ ...item, stock: inventory?.quantity ?? 0 });
          }
        }

        return itemsStock;
      });
    },
  },
};
