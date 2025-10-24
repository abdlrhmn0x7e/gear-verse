import { createTRPCRouter, publicProcedure } from "~/server/api/init";

export const userBrandsRouter = createTRPCRouter({
  queries: {
    findAll: publicProcedure.query(async ({ ctx }) => {
      return ctx.app.public.brands.queries.findAll();
    }),
  },
});
