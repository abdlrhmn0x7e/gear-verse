import { createTRPCRouter, adminProcedure } from "~/server/api/init";
import { brandsGetPageInputSchema } from "@schemas/contracts/admin/brands";
import {
  createBrandInputSchema,
  updateBrandInputSchema,
} from "~/lib/schemas/entities/brand";
import { errorMap } from "../../error-map";
import { tryCatch } from "~/lib/utils/try-catch";
import z from "zod";

export const brandsRouter = createTRPCRouter({
  /**
   * Queries
   */
  queries: {
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
  },

  /**
   * Mutations
   */
  mutations: {
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

    update: adminProcedure
      .input(updateBrandInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.brands.mutations.update(input),
        );

        if (error) {
          throw errorMap(error);
        }
        return data;
      }),

    delete: adminProcedure
      .input(z.object({ brandId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.brands.mutations.delete(input.brandId),
        );

        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
