import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { users } from "./users";

export const reviews = pgTable(
  "reviews",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    productId: bigint("product_id", { mode: "number" })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    userId: bigint("user_id", { mode: "number" })
      .references(() => users.id)
      .notNull(),

    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("reviews_product_id_user_id_unique").on(
      table.productId,
      table.userId,
    ),
  ],
);
