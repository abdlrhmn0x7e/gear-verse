import type { JSONContent } from "@tiptap/react";
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  jsonb,
  pgTable,
  uniqueIndex,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { categories } from "./categories";
import { media } from "./media";
import { productsMedia } from "./products-media";
import { seo } from "./seo";
import { inventoryItems } from "./inventory";

export const products = pgTable(
  "products",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    title: text("title").notNull(),
    price: integer("price").notNull(),
    profit: integer("profit").notNull(),
    margin: integer("margin").notNull(),
    summary: text("summary").notNull(),
    description: jsonb("description").$type<JSONContent>().notNull(),
    published: boolean("published").notNull().default(false),
    slug: text("slug").notNull(),

    thumbnailMediaId: bigint("thumbnail_media_id", {
      mode: "number",
    })
      .references(() => media.id, { onDelete: "set null" })
      .notNull(),
    categoryId: bigint("category_id", { mode: "number" })
      .notNull()
      .references(() => categories.id),
    brandId: bigint("brand_id", { mode: "number" })
      .references(() => brands.id)
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
    uniqueIndex("products_slug_idx").on(table.slug),
  ],
);
export const productRelations = relations(products, ({ one, many }) => ({
  thumbnail: one(media, {
    fields: [products.thumbnailMediaId],
    references: [media.id],
    relationName: "products_thumbnail",
  }),
  media: many(productsMedia, {
    relationName: "products_media",
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  options: many(productOptions),
  variants: many(productVariants),
  seo: one(seo, {
    fields: [products.id],
    references: [seo.productId],
  }),
}));

export const productOptions = pgTable(
  "product_options",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    productId: bigint("product_id", { mode: "number" })
      .references(() => products.id)
      .notNull(),

    name: text("name").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("product_options_product_id_name_idx").on(
      table.productId,
      table.name,
    ),
  ],
);
export const productOptionsRelations = relations(
  productOptions,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productOptions.productId],
      references: [products.id],
    }),
    values: many(productOptionValues),
  }),
);

export const productOptionValues = pgTable(
  "product_option_values",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    productOptionId: bigint("product_option_id", { mode: "number" })
      .references(() => productOptions.id)
      .notNull(),

    value: text("value").notNull(),
    order: integer("order").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("product_option_values_product_option_id_value_idx").on(
      table.productOptionId,
      table.value,
    ),
  ],
);
export const productOptionValuesRelations = relations(
  productOptionValues,
  ({ one, many }) => ({
    option: one(productOptions, {
      fields: [productOptionValues.productOptionId],
      references: [productOptions.id],
    }),
    variants: many(productOptionValuesVariants),
  }),
);

export const productVariants = pgTable("product_variants", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

  overridePrice: integer("override_price"),

  productId: bigint("product_id", { mode: "number" })
    .references(() => products.id)
    .notNull(),
  thumbnailMediaId: bigint("thumbnail_media_id", { mode: "number" })
    .references(() => media.id, { onDelete: "set null" })
    .notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    thumbnail: one(media, {
      fields: [productVariants.thumbnailMediaId],
      references: [media.id],
    }),
    optionValues: many(productOptionValuesVariants),
    stock: one(inventoryItems),
  }),
);

export const productOptionValuesVariants = pgTable(
  "product_option_values_variants",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    productOptionValueId: bigint("product_option_value_id", { mode: "number" })
      .references(() => productOptionValues.id)
      .notNull(),
    productVariantId: bigint("product_variant_id", { mode: "number" })
      .references(() => productVariants.id)
      .notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex(
      "product_option_values_variants_product_option_value_id_product_variant_id_idx",
    ).on(table.productOptionValueId, table.productVariantId),
  ],
);
export const productOptionValuesVariantsRelations = relations(
  productOptionValuesVariants,
  ({ one }) => ({
    optionValue: one(productOptionValues, {
      fields: [productOptionValuesVariants.productOptionValueId],
      references: [productOptionValues.id],
    }),
    variant: one(productVariants, {
      fields: [productOptionValuesVariants.productVariantId],
      references: [productVariants.id],
    }),
  }),
);
