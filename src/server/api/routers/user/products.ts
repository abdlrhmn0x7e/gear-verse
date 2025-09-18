import { DB } from "~/server/repositories";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { paginate } from "../../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";
import z from "zod";
import { TRPCError } from "@trpc/server";

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
  findBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const product = await DB.user.products.queries.findBySlug(input.slug);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),
});
