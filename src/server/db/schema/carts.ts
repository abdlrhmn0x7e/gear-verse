import {
  bigint,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { productVariants } from "./products";
import { relations } from "drizzle-orm";

export const carts = pgTable(
  "carts",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint("user_id", { mode: "number" })
      .references(() => users.id)
      .notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("carts_user_id_idx").on(table.userId)],
);
export const cartRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItems = pgTable(
  "cart_items",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    cartId: bigint("cart_id", { mode: "number" })
      .notNull()
      .references(() => carts.id),
    productVariantId: bigint("product_variant_id", {
      mode: "number",
    })
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull().default(1),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("cart_items_cart_id_idx").on(table.cartId),
    uniqueIndex("cart_items_cart_id_product_variant_id_idx").on(
      table.cartId,
      table.productVariantId,
    ),
  ],
);
export const cartItemRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  productVariant: one(productVariants, {
    fields: [cartItems.productVariantId],
    references: [productVariants.id],
  }),
}));
