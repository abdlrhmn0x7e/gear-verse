import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { orders } from "./orders";

export const addressGovernoratesEnum = pgEnum("address_governorates", [
  "ALEXANDRIA",
  "ASWAN",
  "ASYUT",
  "BEHEIRA",
  "BENI_SUEF",
  "CAIRO",
  "DAKAHLIA",
  "DAMIETTA",
  "FAIYUM",
  "GHARBIA",
  "GIZA",
  "ISMAILIA",
  "KAFR_EL_SHEIKH",
  "LUXOR",
  "MATROUH",
  "MINYA",
  "MONUFIA",
  "NEW_VALLEY",
  "NORTH_SINAI",
  "PORT_SAID",
  "QALYUBIA",
  "QENA",
  "RED_SEA",
  "SHARQIA",
  "SOHAG",
  "SOUTH_SINAI",
  "SUEZ",
]);

export const addresses = pgTable(
  "addresses",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),

    fullName: text("full_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    address: text("address").notNull(),
    buildingNameOrNumber: text("building_name_or_number").notNull(),
    city: text("city").notNull(),
    governorate: addressGovernoratesEnum("governorate").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_addresses_user_id").on(table.userId)],
);

export const addressRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));
