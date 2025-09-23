import {
  bigint,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { addresses } from "./addresses";
import { relations } from "drizzle-orm";
import { productVariants } from "./product-variants";

export const orderPaymentMethodsEnum = pgEnum("order_payment_methods", ["COD"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
  "CANCELLED",
]);

export const orders = pgTable(
  "orders",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    addressId: bigint("address_id", { mode: "number" })
      .notNull()
      .references(() => addresses.id),

    phoneNumber: text("phone_number").notNull(),
    paymentMethod: orderPaymentMethodsEnum("payment_method").notNull(),
    status: orderStatusEnum("status").notNull().default("PENDING"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("orders_user_id_idx").on(table.userId)],
);
export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
}));

export const orderItems = pgTable(
  "order_items",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    orderId: bigint("order_id", { mode: "number" })
      .notNull()
      .references(() => orders.id),
    productVariantId: bigint("product_variant_id", { mode: "number" })
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("order_items_order_id_product_variant_id_unique").on(
      table.orderId,
      table.productVariantId,
    ),
  ],
);
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));
