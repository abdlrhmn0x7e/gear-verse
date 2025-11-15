import {
  bigint,
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { products } from "./products";
import { relations } from "drizzle-orm";

export const attributeTypesEnum = pgEnum("attribute_types", [
  "SELECT",
  "MULTISELECT",
  "BOOLEAN",
]);

export const attributes = pgTable(
  "attributes",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    type: attributeTypesEnum("type").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },

  (table) => [uniqueIndex("attributes_slug_unique").on(table.slug)],
);

export const attributeRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
  categories: many(categoryAttributes),
}));

export const attributeValues = pgTable(
  "attribute_values",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    attributeId: bigint("attribute_id", { mode: "number" })
      .references(() => attributes.id, { onDelete: "cascade" })
      .notNull(),

    value: text("value").notNull(),
    slug: text("slug").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("attribute_values_attribute_id_value_idx").on(
      table.attributeId,
      table.slug,
    ),
  ],
);

export const attributeValueRelations = relations(
  attributeValues,
  ({ one, many }) => ({
    attribute: one(attributes, {
      fields: [attributeValues.attributeId],
      references: [attributes.id],
    }),
    products: many(productAttributeValues),
  }),
);

export const categoryAttributes = pgTable(
  "category_attributes",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    categoryId: bigint("category_id", { mode: "number" })
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),

    attributeId: bigint("attribute_id", { mode: "number" })
      .references(() => attributes.id, { onDelete: "cascade" })
      .notNull(),

    order: integer("order").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("category_attributes_category_id_attribute_id_idx").on(
      table.categoryId,
      table.attributeId,
    ),
  ],
);

export const productAttributeValues = pgTable(
  "product_attribute_values",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    productId: bigint("product_id", { mode: "number" })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),

    attributeValueId: bigint("attribute_value_id", { mode: "number" })
      .references(() => attributeValues.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex(
      "product_attribute_values_product_id_attribute_value_id_idx",
    ).on(table.productId, table.attributeValueId),
  ],
);
