import { bigint, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { products } from "./products";
import { relations } from "drizzle-orm";

export const seo = pgTable(
  "seo",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    pageTitle: text("page_title"),
    urlHandler: text("url_handler"),
    metaDescription: text("meta_description"),
  },
  (table) => ({
    uniqueProductId: uniqueIndex("unique_product_id").on(table.productId),
  }),
);

export const seoRelations = relations(seo, ({ one }) => ({
  product: one(products, {
    fields: [seo.productId],
    references: [products.id],
  }),
}));
