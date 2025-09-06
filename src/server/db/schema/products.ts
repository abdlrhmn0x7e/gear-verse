import {
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { brands } from "./brands";
import { relations } from "drizzle-orm";
import { media } from "./media";
import { listingProducts } from "./listing-products";

export const products = pgTable(
  "products",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    title: text("title").notNull(),
    description: jsonb("description").notNull(),

    thumbnailMediaId: bigint("thumbnail_media_id", {
      mode: "number",
    })
      .references(() => media.id)
      .notNull(),

    categoryId: bigint("category_id", { mode: "number" })
      .notNull()
      .references(() => categories.id),
    brandId: bigint("brand_id", { mode: "number" })
      .references(() => brands.id)
      .notNull(),

    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("products_title_idx").on(table.title),
    index("products_brand_id_idx").on(table.brandId),
    index("products_category_id_idx").on(table.categoryId),
    uniqueIndex("products_thumbnail_media_id_idx").on(table.thumbnailMediaId),
  ],
);

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  media: many(media),
  productsToListings: many(listingProducts),
}));
