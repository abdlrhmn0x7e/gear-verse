import {
  bigint,
  check,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { products, productVariants } from "./products";

export const inventoryItemTypes = pgEnum("inventory_item_types", [
  "VARIANT",
  "PRODUCT",
]);

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    itemId: bigint("item_id", { mode: "number" }).notNull(),
    itemType: inventoryItemTypes("item_type").notNull(),

    quantity: integer("quantity").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("inventory_items_item_id_item_type_unique").on(
      table.itemId,
      table.itemType,
    ),
    check("inventory_quantity_non_negative", sql`${table.quantity} >= 0`),
  ],
);

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventoryItems.itemId],
    references: [productVariants.id],
  }),
  product: one(products, {
    fields: [inventoryItems.itemId],
    references: [products.id],
  }),
}));
