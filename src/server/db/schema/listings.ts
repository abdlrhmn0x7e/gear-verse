import {
  bigint,
  integer,
  numeric,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { listingProducts } from "./listing-products";

export const listings = pgTable("listings", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

  price: numeric("price", { precision: 4, scale: 2 }).notNull(),
  stock: integer("stock").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listingRelations = relations(listings, ({ many }) => ({
  listingToProducts: many(listingProducts),
}));
