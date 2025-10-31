import { tryCatch } from "~/lib/utils/try-catch";
import { adminProcedure, createTRPCRouter } from "../../init";
import { usersGetPageInputSchema } from "~/lib/schemas/contracts/admin/users";
import { errorMap } from "../../error-map";
import { createUserInputSchema } from "~/lib/schemas/entities/users";

export const usersRouter = createTRPCRouter({
  queries: {
    getPage: adminProcedure
      .input(usersGetPageInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.users.queries.getPage(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    getCount: adminProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.users.queries.getCount(),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),
  },

  mutations: {
    create: adminProcedure
      .input(createUserInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.users.mutations.create(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
