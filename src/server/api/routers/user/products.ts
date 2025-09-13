import { DB } from "~/server/repositories";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { paginate } from "../../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";

export const productsRouter = createTRPCRouter({
  getPage: publicProcedure.input(paginationSchema).query(({ input }) => {
    return paginate({ input, getPage: DB.user.products.queries.getPage });
  }),
});
