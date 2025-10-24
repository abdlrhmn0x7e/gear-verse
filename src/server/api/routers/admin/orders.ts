import { createTRPCRouter, adminProcedure } from "~/server/api/init";
import z from "zod";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { ordersGetPageInputSchema } from "~/lib/schemas/contracts/admin/orders";

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
  },
});
