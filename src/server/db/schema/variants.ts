import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { relations } from "drizzle-orm";
import { media } from "./media";

export const variants = pgTable(
  "variants",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    name: text("name").notNull(),

    thumbnailMediaId: bigint("thumbnail_media_id", {
      mode: "number",
    }).references(() => media.id, { onDelete: "set null" }),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    stock: integer("stock").notNull(),
    price: integer("price").notNull(),
    options: jsonb("options").$type<Array<string>>().notNull().default([]),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("variants_thumbnail_media_id_idx").on(table.thumbnailMediaId),
    index("variants_product_id_idx").on(table.productId),
  ],
);

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),

  thumbnail: one(media, {
    fields: [variants.thumbnailMediaId],
    references: [media.id],
    relationName: "variants_thumbnail",
  }),
}));
