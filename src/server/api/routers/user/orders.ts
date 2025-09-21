import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const userOrdersRouter = createTRPCRouter({
  findAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.orders.queries.findAll(Number(ctx.session.user.id));
  }),
  findById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.user.orders.queries.findById(
        input.id,
        Number(ctx.session.user.id),
      );
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),
});
