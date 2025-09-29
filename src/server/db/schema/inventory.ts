import {
  bigint,
  check,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { productVariants } from "./products";

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    variantId: bigint("variant_id", { mode: "number" })
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),

    quantity: integer("quantity").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("inventory_variant_id_idx").on(table.variantId),
    check("inventory_quantity_non_negative", sql`${table.quantity} >= 0`),
  ],
);

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventoryItems.variantId],
    references: [productVariants.id],
  }),
}));
