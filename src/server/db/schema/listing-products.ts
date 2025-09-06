import { pgTable, bigint, uniqueIndex } from "drizzle-orm/pg-core";
import { listings } from "./listings";
import { products } from "./products";
import { relations } from "drizzle-orm";

export const listingProducts = pgTable(
  "listing_products",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    listingId: bigint("listing_id", { mode: "number" })
      .notNull()
      .references(() => listings.id),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id),
  },
  (table) => [
    uniqueIndex("listing_products_unique").on(table.listingId, table.productId),
  ],
);

export const listingProductsRelations = relations(
  listingProducts,
  ({ one }) => ({
    listing: one(listings, {
      fields: [listingProducts.listingId],
      references: [listings.id],
    }),
    product: one(products, {
      fields: [listingProducts.productId],
      references: [products.id],
    }),
  }),
);
