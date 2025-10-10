import { categoryEntitySchema } from "~/lib/schemas/entities/category";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../../trpc";
import { errorMap } from "../../error-map";
import { tryCatch } from "~/lib/utils/try-catch";
import { deleteCategoryInputSchema } from "~/lib/schemas/contracts/admin/categories";

export const categoriesRouter = createTRPCRouter({
  /**
   * Queries
   */
  queries: {
    findAll: publicProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.categories.queries.findAll(),
      );
      if (error) {
        throw errorMap(error);
      }

      return data;
    }),
  },

  /**
   * Mutations
   */
  mutations: {
    create: adminProcedure
      .input(
        categoryEntitySchema.omit({
          id: true,
          slug: true,
          created_at: true,
          updated_at: true,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.categories.mutations.create(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
    delete: adminProcedure
      .input(deleteCategoryInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.categories.mutations.delete(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
