import { eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { storeSettings } from "~/server/db/schema";

type StoreSettingsDto = Omit<
  typeof storeSettings.$inferInsert,
  "id" | "updatedAt"
>;

/** The table holds one row, always id 1. */
const SETTINGS_ID = 1;

const columns = {
  whatsappNumber: storeSettings.whatsappNumber,
  instagramUrl: storeSettings.instagramUrl,
  facebookUrl: storeSettings.facebookUrl,
  tiktokUrl: storeSettings.tiktokUrl,
  discordUrl: storeSettings.discordUrl,
  xUrl: storeSettings.xUrl,
  youtubeUrl: storeSettings.youtubeUrl,
  lowStockThreshold: storeSettings.lowStockThreshold,
  orderNotificationEmails: storeSettings.orderNotificationEmails,
  updatedAt: storeSettings.updatedAt,
};

export const _settings = {
  queries: {
    find: async () => {
      return db
        .select(columns)
        .from(storeSettings)
        .where(eq(storeSettings.id, SETTINGS_ID))
        .then(([row]) => row ?? null);
    },

    findOrderNotificationEmails: async () => {
      return db
        .select({ emails: storeSettings.orderNotificationEmails })
        .from(storeSettings)
        .where(eq(storeSettings.id, SETTINGS_ID))
        .then(([row]) => row?.emails ?? []);
    },
  },

  mutations: {
    upsert: async (input: StoreSettingsDto) => {
      return db
        .insert(storeSettings)
        .values({ ...input, id: SETTINGS_ID })
        .onConflictDoUpdate({
          target: storeSettings.id,
          set: { ...input, updatedAt: sql`now()` },
        })
        .returning(columns)
        .then(([row]) => row!);
    },
  },
};
