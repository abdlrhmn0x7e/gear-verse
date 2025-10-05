import { inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { inventoryItems } from "~/server/db/schema";

export const _inventory = {
  queries: {
    getItemsStock: async (productVariantIds: number[]) => {
      return db
        .select({ id: inventoryItems.id, stock: inventoryItems.quantity })
        .from(inventoryItems)
        .where(inArray(inventoryItems.variantId, productVariantIds));
    },
  },
};
