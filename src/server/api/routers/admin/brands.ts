import { adminProcedure, createTRPCRouter } from "../../trpc";
import { brandsGetPageInputSchema } from "@schemas/contracts/admin/brands";
import {
  brandEntitySchema,
  createBrandInputSchema,
} from "~/lib/schemas/entities/brand";
import { errorMap } from "../../error-map";
import { tryCatch } from "~/lib/utils/try-catch";

export const brandsRouter = createTRPCRouter({
  /**
   * Queries
   */
  getPage: adminProcedure
    .input(brandsGetPageInputSchema)
    .query(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.brands.queries.getPage(input),
      );
      if (error) {
        throw errorMap(error);
      }

      return data;
    }),

  /**
   * Mutations
   */
  create: adminProcedure
    .input(createBrandInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.brands.mutations.create(input),
      );

      if (error) {
        throw errorMap(error);
      }
      return data;
    }),
});
