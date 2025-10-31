import { createTRPCRouter, adminProcedure } from "~/server/api/init";
import z from "zod";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { ordersGetPageInputSchema } from "~/lib/schemas/contracts/admin/orders";
import {
  createFullOrderInputSchema,
  createOrderInputSchema,
  updateFullOrderInputSchema,
} from "~/lib/schemas/entities";

export const adminOrdersRouter = createTRPCRouter({
  queries: {
    getPage: adminProcedure
      .input(ordersGetPageInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.orders.queries.getPage(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    getCount: adminProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.orders.queries.getCount(),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),

    findById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.orders.queries.findById(input.id),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    findDetailsById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.orders.queries.findDetailsById(input.id),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },

  mutations: {
    create: adminProcedure
      .input(createFullOrderInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.orders.mutations.create(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    update: adminProcedure
      .input(updateFullOrderInputSchema.extend({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.orders.mutations.update(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
