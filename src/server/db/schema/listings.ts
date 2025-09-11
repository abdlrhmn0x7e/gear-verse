import {
  bigint,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { listingProducts } from "./listing-products";
import { media } from "./media";

export const listings = pgTable(
  "listings",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 7, scale: 2 }).notNull(),
    stock: integer("stock").notNull(),

    thumbnailMediaId: bigint("thumbnail_media_id", {
      mode: "number",
    }).references(() => media.id),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("thumbnail_media_id_idx").on(table.thumbnailMediaId),
    uniqueIndex("listings_slug_unique").on(table.slug),
  ],
);

export const listingRelations = relations(listings, ({ one, many }) => ({
  products: many(listingProducts),
  thumbnail: one(media, {
    fields: [listings.thumbnailMediaId],
    references: [media.id],
  }),
}));
