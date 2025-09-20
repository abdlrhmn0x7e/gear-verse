import {
  categorySchema,
  categoryTreeSchema,
  type Category,
} from "~/lib/schemas/category";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../../trpc";
import { z } from "zod";
import { generateSlug } from "~/lib/utils/slugs";

export const categoriesRouter = createTRPCRouter({
  /**
   * Queries
   */
  findAll: publicProcedure
    .output(z.array(categoryTreeSchema))
    .query(({ ctx }) => {
      return ctx.db.admin.categories.queries.findAll();
    }),

  /**
   * Mutations
   */
  create: adminProcedure
    .input(categorySchema.omit({ id: true, slug: true, created_at: true }))
    .mutation(async ({ ctx, input }) => {
      let parentCategory: Category | undefined = undefined;

      if (input.parent_id) {
        parentCategory = await ctx.db.admin.categories.queries.findById(
          input.parent_id,
        );
      }

      return await ctx.db.admin.categories.mutations.create({
        ...input,
        slug: generateSlug(`${input.name} ${parentCategory?.name ?? ""}`),
      });
    }),
});
