import { createTRPCRouter, publicProcedure } from "~/server/api/init";
import z from "zod";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import {
  localeSchema,
  productsGetPageInputSchema,
} from "~/lib/schemas/contracts/public/products";

export const userProductsRouter = createTRPCRouter({
  queries: {
    getPage: publicProcedure
      .input(productsGetPageInputSchema)
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
      .input(z.object({ slug: z.string(), locale: localeSchema }))
      .query(async ({ ctx, input }) => {
        const { data: product, error: productError } = await tryCatch(
          ctx.app.public.products.queries.findBySlug(input.slug, input.locale),
        );
        if (productError) {
          throw errorMap(productError);
        }

        return product;
      }),
  },
});
