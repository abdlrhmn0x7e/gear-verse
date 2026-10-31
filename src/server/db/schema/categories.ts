import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { categoryAttributes } from "./attributes";
import { media } from "./media";

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
    // the category page's intro and meta description; null falls back to a shared line
    description: text("description"),
    // Arabic twins; null shows the English on the Arabic site
    name_ar: text("name_ar"),
    description_ar: text("description_ar"),
    // a person checked the Arabic against the current English
    ar_reviewed: boolean("ar_reviewed").notNull().default(false),

    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),

    parent_id: bigint("parent_id", { mode: "number" }),
    // the home page tile's image; null uses the newest in-stock product's photo
    cover_media_id: bigint("cover_media_id", { mode: "number" }).references(
      () => media.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
      name: "categories_parent_id_fkey",
    }).onDelete("cascade"),
    index("categories_parent_id_idx").on(table.parent_id),
    index("categories_cover_media_id_idx").on(table.cover_media_id),
    uniqueIndex("categories_slug_unique").on(table.slug),
  ],
);

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parent_id],
    references: [categories.id],
  }),
  attributes: many(categoryAttributes),
}));
