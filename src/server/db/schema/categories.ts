import { relations } from "drizzle-orm";
import {
  bigint,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    name: text("name").notNull(),
    parent_id: bigint("parent_id", { mode: "number" }),
    slug: text("slug").notNull(),

    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
      name: "categories_parent_id_fkey",
    }),
    index("categories_parent_id_idx").on(table.parent_id),
  ],
);

export const categoryRelations = relations(categories, ({ one }) => ({
  parent: one(categories, {
    fields: [categories.parent_id],
    references: [categories.id],
  }),
}));
