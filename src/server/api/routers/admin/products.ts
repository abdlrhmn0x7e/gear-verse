import {
  createProductInputSchema,
  updateProductInputSchema,
} from "@schemas/entities";
import z from "zod";
import { productsGetPageInputSchema } from "~/lib/schemas/contracts/admin/products";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { createTRPCRouter, adminProcedure } from "~/server/api/init";

export const productsRouter = createTRPCRouter({
  /**
   * Queries
   */
  queries: {
    getPage: adminProcedure
      .input(productsGetPageInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.products.queries.getPage(input),
        );

        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    findById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data: product, error: productError } = await tryCatch(
          ctx.app.admin.products.queries.findById(input.id),
        );
        if (productError) {
          throw errorMap(productError);
        }

        return product;
      }),
  },

  /**
   * Mutations
   */
  mutations: {
    createDeep: adminProcedure
      .input(createProductInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.products.mutations.createDeep(input),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    editDeep: adminProcedure
      .input(z.object({ id: z.number(), data: updateProductInputSchema }))
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.products.mutations.editDeep(input.id, input.data),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.products.mutations.delete(input.id),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },
});
