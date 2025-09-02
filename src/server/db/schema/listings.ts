import {
  bigint,
  integer,
  numeric,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { relations } from "drizzle-orm";

export const listings = pgTable("listings", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

  price: numeric("price", { precision: 4, scale: 2 }).notNull(),
  stock: integer("stock").notNull(),

  productId: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listingRelations = relations(listings, ({ one }) => ({
  product: one(products, {
    fields: [listings.productId],
    references: [products.id],
  }),
}));
