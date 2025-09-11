import type { JSONContent } from "@tiptap/react";
import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { categories } from "./categories";
import { listingProducts } from "./listing-products";
import { media } from "./media";
import { productVariants } from "./product-variants";

export const products = pgTable(
  "products",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    title: text("title").notNull(),
    description: jsonb("description").$type<JSONContent>().notNull(),

    categoryId: bigint("category_id", { mode: "number" })
      .notNull()
      .references(() => categories.id),
    brandId: bigint("brand_id", { mode: "number" })
      .references(() => brands.id)
      .notNull(),

    specifications: jsonb("specifications")
      .$type<Record<string, string>>()
      .notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("products_title_idx").on(table.title),
    index("products_brand_id_idx").on(table.brandId),
    index("products_category_id_idx").on(table.categoryId),
    index("products_specifications_idx").using("gin", table.specifications),
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
  images: many(media),
  listings: many(listingProducts),
  variants: many(productVariants),
}));
