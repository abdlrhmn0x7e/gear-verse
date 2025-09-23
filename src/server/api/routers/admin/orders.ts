import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { paginate } from "../../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";
import z from "zod";

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
});
