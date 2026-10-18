import { tryCatch } from "~/lib/utils/try-catch";
import { adminProcedure, createTRPCRouter } from "../../init";
import { errorMap } from "../../error-map";
import { updateStoreSettingsInputSchema } from "~/lib/schemas/entities/store-settings";

export const settingsRouter = createTRPCRouter({
  queries: {
    get: adminProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.settings.queries.get(),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),
  },

  mutations: {
    update: adminProcedure
      .input(updateStoreSettingsInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.settings.mutations.update(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
