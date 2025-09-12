import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { relations } from "drizzle-orm";
import { media } from "./media";

export const productVariants = pgTable(
  "product_variants",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    name: text("name").notNull(),

    thumbnailMediaId: bigint("thumbnail_media_id", {
      mode: "number",
    }).references(() => media.id),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id),

    stock: integer("stock").notNull(),
    price: integer("price").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("product_variants_thumbnail_media_id_idx").on(table.thumbnailMediaId),
    index("product_variants_product_id_idx").on(table.productId),
  ],
);

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    thumbnail: one(media, {
      fields: [productVariants.thumbnailMediaId],
      references: [media.id],
      relationName: "product_variants_thumbnail",
    }),
    images: many(media, { relationName: "product_variants_images" }),
  }),
);
