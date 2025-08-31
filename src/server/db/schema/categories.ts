import { relations } from "drizzle-orm";
import {
  bigint,
  foreignKey,
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
    parentId: bigint("parent_id", { mode: "number" }),
    slug: text("slug").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "fk_categories_parent_id",
    }),
  ],
);

export const categoryRelations = relations(categories, ({ one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}));
