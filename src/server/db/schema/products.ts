import type { JSONContent } from "@tiptap/react";
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { categories } from "./categories";
import { productVariants } from "./product-variants";
import { media } from "./media";

export const products = pgTable(
  "products",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    name: text("name").notNull(),
    summary: text("summary").notNull(),
    description: jsonb("description").$type<JSONContent>().notNull(),
    published: boolean("published").notNull().default(false),
    slug: text("slug").notNull(),

    thumbnailMediaId: bigint("thumbnail_media_id", {
      mode: "number",
    }).references(() => media.id, { onDelete: "set null" }),

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
    index("products_name_idx").on(table.name),
    index("products_brand_id_idx").on(table.brandId),
    index("products_category_id_idx").on(table.categoryId),
    index("products_specifications_idx").using("gin", table.specifications),
  ],
);

export const productRelations = relations(products, ({ one, many }) => ({
  thumbnail: one(media, {
    fields: [products.thumbnailMediaId],
    references: [media.id],
    relationName: "products_thumbnail",
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  variants: many(productVariants),
}));
