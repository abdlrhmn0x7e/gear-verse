import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { variants } from "./variants";

export const inventory = pgTable("inventory", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  variantId: bigint("variant_id", { mode: "number" }).references(
    () => variants.id,
  ),
  stock: integer("stock").notNull(),
});

export const refTypeEnum = pgEnum("ref_type", ["SALE"]);
export const inventoryMovementTypeEnum = pgEnum("inventory_movement_type", [
  "IN",
  "OUT",
]);

export const inventoryMovements = pgTable("inventory_movements", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  inventoryId: bigint("inventory_id", { mode: "number" }).references(
    () => inventory.id,
  ),

  change: integer("change").notNull(),
  type: inventoryMovementTypeEnum("type").notNull(),

  refType: refTypeEnum("ref_type").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
