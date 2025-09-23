import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { paginate } from "../../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";
import z from "zod";
import { TRPCError } from "@trpc/server";

export const adminOrdersRouter = createTRPCRouter({
  getPage: protectedProcedure
    .input(
      paginationSchema.extend({
        filters: z
          .object({
            orderId: z.number(),
            status: z.enum([
              "PENDING",
              "SHIPPED",
              "DELIVERED",
              "REFUNDED",
              "CANCELLED",
            ]),
            paymentMethod: z.enum(["COD"]),
          })
          .partial()
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return paginate({ input, getPage: ctx.db.admin.orders.getPage });
    }),
  findById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.admin.orders.findById({ id: input.id });
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      return order;
    }),
});
