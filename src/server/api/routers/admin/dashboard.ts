import z from "zod";
import { adminProcedure, createTRPCRouter } from "~/server/api/init";
import { tryCatch } from "~/lib/utils/try-catch";
import { dashboardRanges } from "~/server/application/helpers/dashboard-range";
import { errorMap } from "../../error-map";

const rangeInput = z.object({ range: z.enum(dashboardRanges) });

// one procedure per dashboard panel, so each streams in on its own
export const dashboardRouter = createTRPCRouter({
  queries: {
    revenue: adminProcedure.input(rangeInput).query(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.dashboard.queries.revenue(input.range),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),

    orders: adminProcedure.input(rangeInput).query(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.dashboard.queries.orders(input.range),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),

    pending: adminProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.dashboard.queries.pending(),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),

    lowStock: adminProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.dashboard.queries.lowStock(),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),

    topProducts: adminProcedure
      .input(rangeInput)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.dashboard.queries.topProducts(input.range),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    reviews: adminProcedure.input(rangeInput).query(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.dashboard.queries.reviews(input.range),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),
  },
});
