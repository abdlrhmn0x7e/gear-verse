import { cacheLife, cacheTag } from "next/cache";
import type { StoreSettings } from "~/lib/schemas/entities/store-settings";
import { app } from "~/server/application";

export type { StoreSettings };

/**
 * The store's contact details, social links and stock threshold, for any
 * server component. Saving the settings in the admin expires the
 * "store-settings" tag, so a change shows on the next request.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";

  cacheTag("store-settings");
  // Saves expire the tag; the hourly revalidate only matters while the table
  // is missing and the defaults stand in for it.
  cacheLife("hours");

  return app.public.settings.queries.get();
}
