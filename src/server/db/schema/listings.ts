import {
  bigint,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { listingProducts } from "./listing-products";
import { media } from "./media";

export const listings = pgTable("listings", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

  title: text("title").notNull(),
  price: numeric("price", { precision: 4, scale: 2 }).notNull(),
  stock: integer("stock").notNull(),

  thumbnailMediaId: bigint("thumbnail_media_id", {
    mode: "number",
  })
    .references(() => media.id)
    .notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listingRelations = relations(listings, ({ one, many }) => ({
  listingToProducts: many(listingProducts),
  thumbnailMedia: one(media, {
    fields: [listings.thumbnailMediaId],
    references: [media.id],
  }),
}));
