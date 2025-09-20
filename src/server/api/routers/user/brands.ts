import { createTRPCRouter, publicProcedure } from "../../trpc";

export const userBrandsRouter = createTRPCRouter({
  findAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.brands.findAll();
  }),
});
