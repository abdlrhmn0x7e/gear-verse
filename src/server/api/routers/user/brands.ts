import { DB } from "~/server/repositories";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const brandsRouter = createTRPCRouter({
  findAll: publicProcedure.query(async () => {
    return DB.user.brands.findAll();
  }),
});
