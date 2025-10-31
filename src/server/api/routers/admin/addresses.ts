import z from "zod";
import { adminProcedure, createTRPCRouter } from "../../init";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { createAddressInputSchema } from "~/lib/schemas/entities";

export const addressesRouter = createTRPCRouter({
  queries: {
    findByUserId: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.addresses.queries.findByUserId(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },

  mutations: {
    create: adminProcedure
      .input(createAddressInputSchema.extend({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.addresses.mutations.create(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
