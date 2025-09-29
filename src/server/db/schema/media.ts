import { relations } from "drizzle-orm";
import { bigint, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { productsMedia } from "./products-media";

export const allowedMimeTypesEnum = pgEnum("allowed_mime_types", [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export const media = pgTable("media", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

  name: text("name").notNull(),
  url: text("url").notNull(),
  mimeType: allowedMimeTypesEnum("mime_type").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const mediaRelations = relations(media, ({ many }) => ({
  products: many(productsMedia, { relationName: "products_media" }),
}));
