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

/**
 * The price a product is listed at: its cheapest variant still on sale, or
 * its own price when it has none. Raw names so it also reads a cursor id.
 */
export function listedPriceSql(
  productId: AnyPgColumn | SQL | number | undefined,
): SQL<number> {
  return sql<number>`(
    select coalesce(min(coalesce(listed_variants.override_price, listed_products.price)), listed_products.price)
    from ${products} as listed_products
    left join ${productVariants} as listed_variants
      on listed_variants.product_id = listed_products.id
      and listed_variants.archived = false
    where listed_products.id = ${productId}
    group by listed_products.price
  )`;
}
