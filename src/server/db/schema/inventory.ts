import {
  bigint,
  check,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { products, productVariants } from "./products";

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    productVariantId: bigint("product_variant_id", {
      mode: "number",
    }).references(() => productVariants.id, { onDelete: "cascade" }),

    quantity: integer("quantity").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("inventory_items_product_id_product_variant_id_unique").on(
      table.productId,
      table.productVariantId,
    ),
    check("inventory_quantity_non_negative", sql`${table.quantity} >= 0`),
  ],
);

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventoryItems.productVariantId],
    references: [productVariants.id],
  }),
  product: one(products, {
    fields: [inventoryItems.productId],
    references: [products.id],
  }),
}));
