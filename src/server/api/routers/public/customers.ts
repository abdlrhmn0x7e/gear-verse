import { tryCatch } from "~/lib/utils/try-catch";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { errorMap } from "../../error-map";

export const userCustomersRouter = createTRPCRouter({
  queries: {
    getCustomerSummary: publicProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.public.customers.queries.getCustomerSummary(),
      );
      if (error) {
        throw errorMap(error);
      }

      return data;
    }),
  },
});
