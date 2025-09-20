import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const userOrdersRouter = createTRPCRouter({
  findById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.user.orders.queries.findById(input.id);
    }),
});
