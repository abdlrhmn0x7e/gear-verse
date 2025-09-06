import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { brands } from "./brands";

export const mediaOwnerTypeEnum = pgEnum("owner_type", [
  "PRODUCT",
  "CATEGORY",
  "BRAND",
  "USER",
  "LISTING",
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
  },
  (table) => [index("media_owner_id_idx").on(table.ownerId)],
);

export const mediaRelations = relations(media, ({ one }) => ({
  products: one(products, {
    fields: [media.ownerId],
    references: [products.id],
  }),
  brands: one(brands, {
    fields: [media.ownerId],
    references: [brands.id],
  }),
}));
