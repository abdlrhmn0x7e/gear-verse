import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { products } from "./products";

/**
 * The admin's order for a category page, lowest first. A page lists its
 * category's whole subtree, so the order belongs to the page's category, not
 * the product's. Products without a row follow, newest first; a row whose
 * product has left the subtree does nothing until the next reorder drops it.
 */
export const categoryProductPositions = pgTable(
  "category_product_positions",
  {
    categoryId: bigint("category_id", { mode: "number" })
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.categoryId, table.productId] }),
    uniqueIndex("category_product_positions_category_id_position_idx").on(
      table.categoryId,
      table.position,
    ),
  ],
);
