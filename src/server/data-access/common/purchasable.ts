import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { inventoryItems, products, productVariants } from "~/server/db/schema";

/**
 * True when the product has stock: its own stock row, or a variant that is
 * still on sale, has stock.
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

/** True when the product can be bought: it has stock or takes backorders. Needs `products` in the query. */
export function purchasableSql(): SQL<boolean> {
  return sql<boolean>`(${products.allowBackorder} or ${inStockSql(products.id)})`;
}
