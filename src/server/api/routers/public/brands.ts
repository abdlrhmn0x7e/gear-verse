import { brandsFindAllInputSchema } from "~/lib/schemas/contracts/public/brands";
import { tryCatch } from "~/lib/utils/try-catch";
import { createTRPCRouter, publicProcedure } from "~/server/api/init";
import { errorMap } from "../../error-map";

export const userBrandsRouter = createTRPCRouter({
  queries: {
    findAll: publicProcedure
      .input(brandsFindAllInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.brands.queries.findAll(input),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },
});
