import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";

export const userOrdersRouter = createTRPCRouter({
  queries: {
    findAll: protectedProcedure.query(({ ctx }) => {
      return ctx.app.public.orders.queries.findAll(Number(ctx.session.user.id));
    }),

    findById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data: order, error } = await tryCatch(
          ctx.app.public.orders.queries.findById(
            input.id,
            Number(ctx.session.user.id),
          ),
        );

        if (error) {
          throw errorMap(error);
        }

        return order;
      }),
  },
});
