import z from "zod";
import {
  categoriesFindAllInputSchema,
  categoryProductsInputSchema,
} from "~/lib/schemas/contracts/public/categories";
import { createTRPCRouter, publicProcedure } from "~/server/api/init";

export const userCategoriesRouter = createTRPCRouter({
  queries: {
    findAll: publicProcedure
      .input(categoriesFindAllInputSchema)
      .query(({ ctx, input }) => {
        return ctx.app.public.categories.queries.findAll(input);
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
