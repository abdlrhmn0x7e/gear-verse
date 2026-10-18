import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { storeSettings } from "~/server/db/schema";

export const _settings = {
  queries: {
    find: async () => {
      return db
        .select({
          whatsappNumber: storeSettings.whatsappNumber,
          instagramUrl: storeSettings.instagramUrl,
          facebookUrl: storeSettings.facebookUrl,
          tiktokUrl: storeSettings.tiktokUrl,
          discordUrl: storeSettings.discordUrl,
          xUrl: storeSettings.xUrl,
          youtubeUrl: storeSettings.youtubeUrl,
          lowStockThreshold: storeSettings.lowStockThreshold,
          updatedAt: storeSettings.updatedAt,
        })
        .from(storeSettings)
        .where(eq(storeSettings.id, 1))
        .then(([row]) => row ?? null);
    },
  },
};
