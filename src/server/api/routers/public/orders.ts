import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { ordersGetPageInputSchema } from "~/lib/schemas/contracts/public/orders";

export const userOrdersRouter = createTRPCRouter({
  queries: {
    findAll: protectedProcedure
      .input(ordersGetPageInputSchema)
      .query(async ({ ctx }) => {
        const parsedUserId = Number(ctx.session.user.id);

        const { data, error } = await tryCatch(
          ctx.app.public.orders.queries.getPage({
            userId: parsedUserId,
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
        const parsedUserId = Number(ctx.session.user.id);
        const { data: order, error } = await tryCatch(
          ctx.app.public.orders.queries.findById(input.id, parsedUserId),
        );

        if (error) {
          throw errorMap(error);
        }

        return order;
      }),
  },
});
