import { headers } from "next/headers";
import { tryCatch } from "~/lib/utils/try-catch";
import { adminProcedure, createTRPCRouter } from "../../init";
import {
  banUserInputSchema,
  setUserRoleInputSchema,
  userIdInputSchema,
  usersGetManagePageInputSchema,
  usersGetPageInputSchema,
} from "~/lib/schemas/contracts/admin/users";
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

    getManagePage: adminProcedure
      .input(usersGetManagePageInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.users.queries.getManagePage(input, ctx.user.id),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    getOrders: adminProcedure
      .input(userIdInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.users.queries.getOrders(input),
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

    setRole: adminProcedure
      .input(setUserRoleInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.users.mutations.setRole(input, {
            id: ctx.user.id,
            headers: await headers(),
          }),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    ban: adminProcedure
      .input(banUserInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.users.mutations.ban(input, {
            id: ctx.user.id,
            headers: await headers(),
          }),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    unban: adminProcedure
      .input(userIdInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.users.mutations.unban(input, {
            id: ctx.user.id,
            headers: await headers(),
          }),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
