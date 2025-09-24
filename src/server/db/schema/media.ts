import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { variants } from "./variants";
import { products } from "./products";

export const mediaOwnerTypeEnum = pgEnum("owner_type", [
  "PRODUCT",
  "PRODUCT_VARIANT",
  "CATEGORY",
  "BRAND",
  "USER",
]);
export const mediaStatusEnum = pgEnum("status", ["PENDING", "READY"]);

export const media = pgTable(
  "media",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    ownerType: mediaOwnerTypeEnum().notNull(),
    ownerId: bigint("owner_id", { mode: "number" }).notNull(),

    status: mediaStatusEnum().notNull().default("PENDING"),
    url: text("url").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("media_owner_id_idx").on(table.ownerId)],
);

export const mediaRelations = relations(media, ({ one }) => ({
  brand: one(brands),

  productThumbnail: one(products, {
    fields: [media.ownerId],
    references: [products.id],
    relationName: "products_thumbnail",
  }),

  variantThumbnail: one(variants, {
    fields: [media.ownerId],
    references: [variants.id],
    relationName: "variants_thumbnail",
  }),

  productMedia: one(products, {
    fields: [media.ownerId],
    references: [products.id],
    relationName: "products_media",
  }),
}));
