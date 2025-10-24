import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/init";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { ordersGetPageInputSchema } from "~/lib/schemas/contracts/public/orders";

export const userOrdersRouter = createTRPCRouter({
  queries: {
    getPage: protectedProcedure
      .input(ordersGetPageInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.orders.queries.getPage({
            userId: ctx.user.id,
            ...input,
          }),
        );

        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    findById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data: order, error } = await tryCatch(
          ctx.app.public.orders.queries.findById(input.id, ctx.user.id),
        );

        if (error) {
          throw errorMap(error);
        }

        return order;
      }),
  },
});
