import { relations } from "drizzle-orm";
import {
  bigint,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const categoryIconEnum = pgEnum("category_icon", [
  "KEYBOARDS",
  "MICE",
  "MONITORS",
  "SPEAKERS",
  "HEADSETS",
  "CONTROLLERS",
  "WIRED",
  "WIRELESS",
  "MICROPHONES",
  "STORAGE",
  "LAPTOPS",
  "CHARGERS",
  "BAGS",
  "CABLES",
  "WEBCAMS",
]);

export const categories = pgTable(
  "categories",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    name: text("name").notNull(),
    icon: categoryIconEnum("icon").notNull(),
    slug: text("slug").notNull(),

    created_at: timestamp("created_at").notNull().defaultNow(),

    parent_id: bigint("parent_id", { mode: "number" }),
  },
  (table) => [
    foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
      name: "categories_parent_id_fkey",
    }),
    index("categories_parent_id_idx").on(table.parent_id),
    uniqueIndex("categories_slug_unique").on(table.slug),
  ],
);

export const categoryRelations = relations(categories, ({ one }) => ({
  parent: one(categories, {
    fields: [categories.parent_id],
    references: [categories.id],
  }),
}));
