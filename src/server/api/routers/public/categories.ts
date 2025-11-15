import z from "zod";
import {
  categoriesFindAllInputSchema,
  categoryProductsInputSchema,
} from "~/lib/schemas/contracts/public/categories";
import { tryCatch } from "~/lib/utils/try-catch";
import { createTRPCRouter, publicProcedure } from "~/server/api/init";
import { errorMap } from "../../error-map";

export const userCategoriesRouter = createTRPCRouter({
  queries: {
    findAll: publicProcedure
      .input(categoriesFindAllInputSchema)
      .query(({ ctx, input }) => {
        return ctx.app.public.categories.queries.findAll(input);
      }),

    findRoots: publicProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.public.categories.queries.findRoots(),
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
