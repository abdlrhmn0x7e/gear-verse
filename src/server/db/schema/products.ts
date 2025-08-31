import {
  bigint,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 4, scale: 2 }).notNull(),
  image: text("image").notNull(),
  stock: integer("stock").notNull(),

  category: text("category").notNull(),
  brand: text("brand").notNull(),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
