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
    logoMediaId: bigint("logo_media_id", { mode: "number" })
      .notNull()
      .references(() => media.id),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("brands_logo_media_id_idx").on(table.logoMediaId),
    uniqueIndex("brands_slug_unique").on(table.slug),
  ],
);

export const brandRelations = relations(brands, ({ one }) => ({
  logo: one(media, {
    fields: [brands.logoMediaId],
    references: [media.id],
  }),
}));
