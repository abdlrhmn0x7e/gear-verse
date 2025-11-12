import {
  categoryEntitySchema,
  updateCategoryInputSchema,
} from "~/lib/schemas/entities/category";
import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "~/server/api/init";
import { errorMap } from "../../error-map";
import { tryCatch } from "~/lib/utils/try-catch";
import { deleteCategoryInputSchema } from "~/lib/schemas/contracts/admin/categories";
import { categoriesFindAllInputSchema } from "~/lib/schemas/contracts/public/categories";

export const categoriesRouter = createTRPCRouter({
  /**
   * Queries
   */
  queries: {
    findAll: adminProcedure
      .input(categoriesFindAllInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.categories.queries.findAll(input),
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

    update: adminProcedure
      .input(updateCategoryInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.categories.mutations.update(input),
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
