import { relations, sql } from "drizzle-orm";
import {
  bigint,
  pgTable,
  uniqueIndex,
  timestamp,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { media } from "./media";
import { products } from "./products";

export const productsMedia = pgTable(
  "products_media",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    mediaId: bigint("media_id", { mode: "number" })
      .notNull()
      .references(() => media.id),
    productId: bigint("owner_id", { mode: "number" })
      .references(() => products.id)
      .notNull(),

    order: integer("order").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("products_media_product_id_media_id_idx").on(
      table.productId,
      table.mediaId,
    ),
    check("order_check", sql`${table.order} > 0`),
  ],
);
export const productsMediaRelations = relations(productsMedia, ({ one }) => ({
  media: one(media, {
    fields: [productsMedia.mediaId],
    references: [media.id],
    relationName: "products_media",
  }),

  product: one(products, {
    fields: [productsMedia.productId],
    references: [products.id],
    relationName: "products_media",
  }),
}));
