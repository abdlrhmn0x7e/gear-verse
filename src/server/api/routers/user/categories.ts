import { DB } from "~/server/repositories";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const categoriesRouter = createTRPCRouter({
  findAll: publicProcedure.query(() => {
    return DB.user.categories.queries.findAll();
  }),
});
