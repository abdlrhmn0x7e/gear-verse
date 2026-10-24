import { asc, desc, gt, lt, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { categoryProductPositions, products } from "~/server/db/schema";

export type ProductsSortBy =
  "price-asc" | "price-desc" | "newest" | "oldest" | "trending";

// what an unranked product sorts as, so it follows every ranked one
const LAST = 2147483647;

/**
 * Returns the order by clauses and the keyset predicate for a products page.
 * The cursor is the id of the last product on the previous page, so the
 * predicate has to follow the sort direction (and the price for price sorts,
 * with the id breaking ties) or the next page repeats or skips products.
 * With no `sortBy`, a category page (`categoryId`) follows the admin's order
 * for that category; anything else lists the newest first.
 */
export function getProductsOrdering(
  sortBy: ProductsSortBy | undefined,
  cursor: number | undefined,
  categoryId?: number,
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
    // pinned products first, then the store order, then the newest
    case "trending":
      return rankThenNewest(
        [
          sql`coalesce(${products.pinnedPosition}, ${LAST})`,
          sql`coalesce(${products.position}, ${LAST})`,
        ],
        [
          sql`(select coalesce(cursor_products.pinned_position, ${LAST}) from ${products} as cursor_products where cursor_products.id = ${cursor})`,
          sql`(select coalesce(cursor_products.position, ${LAST}) from ${products} as cursor_products where cursor_products.id = ${cursor})`,
        ],
        cursor,
      );
    case "oldest":
      return {
        orderBy: [asc(products.id)],
        cursorWhere: cursor ? gt(products.id, cursor) : undefined,
      };
    case "newest":
      return newest(cursor);
    default:
      return categoryId === undefined
        ? newest(cursor)
        : rankThenNewest(
            [categoryPosition(categoryId, products.id)],
            [categoryPosition(categoryId, cursor)],
            cursor,
          );
  }
}

function newest(cursor: number | undefined) {
  return {
    orderBy: [desc(products.id)],
    cursorWhere: cursor ? lt(products.id, cursor) : undefined,
  };
}

/** Lowest ranks first, then the newest; `cursorRanks` match the cursor product's ranks. */
function rankThenNewest(
  ranks: SQL[],
  cursorRanks: SQL[],
  cursor: number | undefined,
) {
  return {
    orderBy: [...ranks.map((rank) => asc(rank)), desc(products.id)],
    cursorWhere: cursor
      ? sql`(${sql.join(ranks, sql`, `)}, -${products.id}) > (${sql.join(cursorRanks, sql`, `)}, -${cursor}::bigint)`
      : undefined,
  };
}

function categoryPosition(
  categoryId: number,
  productId: AnyColumn | number | undefined,
) {
  // raw names: the relational query builder would rewrite these columns onto its products alias
  return sql`coalesce((select positions.position from ${categoryProductPositions} as positions where positions.category_id = ${categoryId} and positions.product_id = ${productId}), ${LAST})`;
}
