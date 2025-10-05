import { createTRPCRouter, publicProcedure } from "../../trpc";
import { paginate } from "../../../application/helpers/pagination";
import { paginationSchema } from "~/lib/schemas/contracts/pagination";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";

export const userProductsRouter = createTRPCRouter({
  queries: {
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
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.products.queries.getPage(input),
        );

        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    findBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        const { data: product, error: productError } = await tryCatch(
          ctx.app.public.products.queries.findBySlug(input.slug),
        );
        if (productError) {
          throw errorMap(productError);
        }

        return product;
      }),
  },
});
