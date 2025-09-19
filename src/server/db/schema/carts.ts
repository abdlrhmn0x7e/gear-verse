import { bigint, integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { productVariants } from "./product-variants";

export const carts = pgTable("carts", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: bigint("user_id", { mode: "number" }).references(() => users.id),

  productVariantId: bigint("product_variant_id", { mode: "number" }).references(
    () => productVariants.id,
  ),
  quantity: integer("quantity").default(1),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
