import { revalidateTag } from "next/cache";
import { AppError } from "~/lib/errors/app-error";
import {
  defaultStoreSettings,
  splitEmails,
  type UpdateStoreSettingsInput,
} from "~/lib/schemas/entities/store-settings";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";
import { isUndefinedTable } from "~/server/data-access/common/errors";

export const _settings = {
  queries: {
    /**
     * The saved settings, or the defaults before the first save. `ready` is
     * false while the table itself is missing, so the page can say why saving
     * won't work yet instead of failing to load.
     */
    get: async () => {
      const { data: row, error } = await tryCatch(
        data.admin.settings.queries.find(),
      );

      if (error) {
        if (isUndefinedTable(error)) {
          return {
            ...defaultStoreSettings,
            orderNotificationEmails: [] as string[],
            ready: false,
          };
        }
        throw new AppError(
          "Could not load store settings",
          "INTERNAL",
          undefined,
          error,
        );
      }

      return {
        orderNotificationEmails: [] as string[],
        ...(row ?? defaultStoreSettings),
        ready: true,
      };
    },
  },

  mutations: {
    update: async (input: UpdateStoreSettingsInput) => {
      const { data: row, error } = await tryCatch(
        data.admin.settings.mutations.upsert({
          ...input,
          orderNotificationEmails: splitEmails(input.orderNotificationEmails),
        }),
      );

      if (error) {
        throw new AppError(
          isUndefinedTable(error)
            ? "The store settings table hasn't been created yet"
            : "Could not save store settings",
          "INTERNAL",
          undefined,
          error,
        );
      }

      // tRPC runs in a Route Handler, where updateTag isn't allowed. An
      // immediate expiry gives the same read-your-own-writes result: the next
      // storefront request waits for fresh settings instead of serving stale.
      revalidateTag("store-settings", { expire: 0 });

      return { ...row, ready: true };
    },
  },
};
