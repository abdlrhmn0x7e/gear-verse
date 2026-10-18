import { asc, desc, gt, lt, sql } from "drizzle-orm";
import { products } from "~/server/db/schema";

export type ProductsSortBy = "price-asc" | "price-desc" | "newest" | "oldest";

/**
 * Returns the order by clauses and the keyset predicate for a products page.
 * The cursor is the id of the last product on the previous page, so the
 * predicate has to follow the sort direction (and the price for price sorts,
 * with the id breaking ties) or the next page repeats or skips products.
 */
export function getProductsOrdering(
  sortBy: ProductsSortBy | undefined,
  cursor: number | undefined,
) {
  const cursorPrice = sql`(select cursor_products.price from ${products} as cursor_products where cursor_products.id = ${cursor})`;

  switch (sortBy) {
    case "price-asc":
      return {
        orderBy: [asc(products.price), asc(products.id)],
        cursorWhere: cursor
          ? sql`(${products.price}, ${products.id}) > (${cursorPrice}, ${cursor})`
          : undefined,
      };
    case "price-desc":
      return {
        orderBy: [desc(products.price), desc(products.id)],
        cursorWhere: cursor
          ? sql`(${products.price}, ${products.id}) < (${cursorPrice}, ${cursor})`
          : undefined,
      };
    case "oldest":
      return {
        orderBy: [asc(products.id)],
        cursorWhere: cursor ? gt(products.id, cursor) : undefined,
      };
    // newest is the default
    default:
      return {
        orderBy: [desc(products.id)],
        cursorWhere: cursor ? lt(products.id, cursor) : undefined,
      };
  }
}
