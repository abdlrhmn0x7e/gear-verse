import { createTRPCRouter, publicProcedure } from "../../trpc";
import { paginate } from "../../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";
import z from "zod";
import { TRPCError } from "@trpc/server";

export const userProductsRouter = createTRPCRouter({
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
    .query(({ ctx, input }) => {
      return paginate({ input, getPage: ctx.db.user.products.queries.getPage });
    }),
  findBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.user.products.queries.findBySlug(input.slug);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),
});
