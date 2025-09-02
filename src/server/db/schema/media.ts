import { relations } from "drizzle-orm";
import { bigint, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";
import { brands } from "./brands";

export const ownerTypeEnum = pgEnum("owner_type", [
  "PRODUCT",
  "CATEGORY",
  "BRAND",
]);

export const media = pgTable("media", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

  ownerType: ownerTypeEnum().notNull(),
  ownerId: bigint("owner_id", { mode: "number" }).notNull(),

  url: text("url").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
