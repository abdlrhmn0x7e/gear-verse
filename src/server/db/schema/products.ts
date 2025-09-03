import { bigint, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { brands } from "./brands";
import { relations } from "drizzle-orm";
import { media } from "./media";

export const products = pgTable("products", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

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
});

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
}));
