import { DB } from "~/server/repositories";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const userBrandsRouter = createTRPCRouter({
  findAll: publicProcedure.query(async () => {
    return DB.user.brands.findAll();
  }),
});
