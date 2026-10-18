import {
  defaultStoreSettings,
  type StoreSettings,
} from "~/lib/schemas/entities/store-settings";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";
import { isUndefinedTable } from "~/server/data-access/common/errors";

export const _settings = {
  queries: {
    /**
     * The saved settings, or the defaults when nothing is saved yet. A missing
     * table also reads as defaults, so the storefront keeps working before the
     * table's migration runs.
     */
    get: async (): Promise<StoreSettings> => {
      const { data: row, error } = await tryCatch(
        data.public.settings.queries.find(),
      );

      if (error) {
        if (isUndefinedTable(error)) return defaultStoreSettings;
        throw error;
      }

      return row ?? defaultStoreSettings;
    },
  },
};
