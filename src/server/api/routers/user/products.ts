import { DB } from "~/server/repositories";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { paginate } from "../../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";
import z from "zod";

export const productsRouter = createTRPCRouter({
  getPage: publicProcedure
    .input(
      paginationSchema.extend({
        filters: z
          .object({
            categories: z.array(z.number()),
            brands: z.array(z.number()),
            price: z.object({
              min: z.number(),
              max: z.number(),
            }),
          })
          .partial()
          .optional(),
        sortBy: z
          .enum(["newest", "oldest", "price-asc", "price-desc"])
          .optional(),
      }),
    )
    .query(({ input }) => {
      return paginate({ input, getPage: DB.user.products.queries.getPage });
    }),
});
