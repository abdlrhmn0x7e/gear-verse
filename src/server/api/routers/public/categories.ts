import { categoriesFindAllInputSchema } from "~/lib/schemas/contracts/public/categories";
import { createTRPCRouter, publicProcedure } from "~/server/api/init";

export const userCategoriesRouter = createTRPCRouter({
  queries: {
    findAll: publicProcedure
      .input(categoriesFindAllInputSchema)
      .query(({ ctx, input }) => {
        return ctx.app.public.categories.queries.findAll(input);
      }),
  },
});
