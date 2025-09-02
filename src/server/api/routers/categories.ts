import {
  categorySchema,
  categoryTreeSchema,
  type Category,
} from "~/lib/schemas/category";
import { createTRPCRouter, publicProcedure } from "../trpc";
import slugify from "slugify";
import { DB } from "~/server/repositories";
import { z } from "zod";

export const categoriesRouter = createTRPCRouter({
  findAll: publicProcedure
    .output(z.array(categoryTreeSchema))
    .query(async () => {
      return await DB.categories.queries.findAll();
    }),
  create: publicProcedure
    .input(categorySchema.omit({ id: true, slug: true, created_at: true }))
    .mutation(async ({ input }) => {
      let parentCategory: Category | undefined = undefined;

      if (input.parent_id) {
        parentCategory = await DB.categories.queries.findById(input.parent_id);
      }

      return await DB.categories.mutations.create({
        ...input,
        slug: slugify(`${input.name} ${parentCategory?.name ?? ""}`),
      });
    }),
});
