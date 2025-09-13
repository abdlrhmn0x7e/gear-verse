import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { media } from "./media";
import { relations } from "drizzle-orm";

export const brands = pgTable(
  "brands",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    name: text("name").notNull(),
    logoMediaId: bigint("logo_media_id", { mode: "number" })
      .notNull()
      .references(() => media.id),

    slug: text("slug").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("brands_logo_media_id_idx").on(table.logoMediaId),
    uniqueIndex("brands_slug_idx").on(table.slug),
  ],
);

export const brandRelations = relations(brands, ({ one }) => ({
  logo: one(media, {
    fields: [brands.logoMediaId],
    references: [media.id],
  }),
}));
