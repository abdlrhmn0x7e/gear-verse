import {
  check,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * The store's own details, one row only: the `id = 1` check keeps a second
 * row out, so reads and writes always target id 1. The check names are the
 * ones Postgres gives the table's unnamed checks.
 */
export const storeSettings = pgTable(
  "store_settings",
  {
    id: smallint("id").primaryKey().default(1),

    whatsappNumber: text("whatsapp_number"),
    instagramUrl: text("instagram_url"),
    facebookUrl: text("facebook_url"),
    tiktokUrl: text("tiktok_url"),
    discordUrl: text("discord_url"),
    xUrl: text("x_url"),
    youtubeUrl: text("youtube_url"),

    lowStockThreshold: integer("low_stock_threshold").notNull().default(2),

    /** Who gets an email for each order placed on the store. */
    orderNotificationEmails: text("order_notification_emails")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("store_settings_id_check", sql`${table.id} = 1`),
    check(
      "store_settings_low_stock_threshold_check",
      sql`${table.lowStockThreshold} >= 0`,
    ),
  ],
);
