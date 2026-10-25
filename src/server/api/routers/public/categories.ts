import z from "zod";
import {
  categoriesFindAllInputSchema,
  categoryProductsInputSchema,
} from "~/lib/schemas/contracts/public/categories";
import { tryCatch } from "~/lib/utils/try-catch";
import { createTRPCRouter, publicProcedure } from "~/server/api/init";
import { errorMap } from "../../error-map";
import { localeSchema } from "~/lib/schemas/contracts/public/products";
import { routing } from "~/i18n/routing";

export const userCategoriesRouter = createTRPCRouter({
  queries: {
    findAll: publicProcedure
      .input(categoriesFindAllInputSchema)
      .query(({ ctx, input }) => {
        return ctx.app.public.categories.queries.findAll(
          input,
          input?.locale ?? routing.defaultLocale,
        );
      }),

    findRoots: publicProcedure
      .input(z.object({ locale: localeSchema }).optional())
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.categories.queries.findRoots(
            input?.locale ?? routing.defaultLocale,
          ),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    getProductsPage: publicProcedure
      .input(categoryProductsInputSchema)
      .query(({ ctx, input }) => {
        return ctx.app.public.categories.queries.getProductsPage(input);
      }),

    getAttributes: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ ctx, input }) => {
        return ctx.app.public.categories.queries.getAttributes(input.slug);
      }),
  },
});
