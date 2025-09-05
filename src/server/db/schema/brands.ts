import { bigint, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
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

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("brands_logo_media_id_idx").on(table.logoMediaId)],
);

export const brandRelations = relations(brands, ({ one }) => ({
  logo: one(media, {
    fields: [brands.logoMediaId],
    references: [media.id],
  }),
}));
