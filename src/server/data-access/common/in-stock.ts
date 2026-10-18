import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { inventoryItems, productVariants } from "~/server/db/schema";

/**
 * True when the product can be bought: its own stock row, or a variant that
 * is still on sale, has stock.
 */
export function inStockSql(productId: AnyPgColumn | SQL): SQL<boolean> {
  return sql<boolean>`exists (
    select 1
    from ${inventoryItems}
    left join ${productVariants}
      on ${productVariants.id} = ${inventoryItems.productVariantId}
    where ${inventoryItems.productId} = ${productId}
      and ${inventoryItems.quantity} > 0
      and (
        ${inventoryItems.productVariantId} is null
        or ${productVariants.archived} = false
      )
  )`;
}
