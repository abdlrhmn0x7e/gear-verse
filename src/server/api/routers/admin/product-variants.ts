import z from "zod";
import { adminProcedure, createTRPCRouter } from "../../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { updateProductVariantInputSchema } from "~/lib/schemas/entities/product-variants";

export const productVariantsRouter = createTRPCRouter({
  queries: {
    findById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data: variant, error } = await tryCatch(
          ctx.app.admin.productVariants.queries.findById(input.id),
        );

        if (error) {
          throw errorMap(error);
        }

        return variant;
      }),

    findProductById: adminProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data: product, error } = await tryCatch(
          ctx.app.admin.productVariants.queries.findProductById(
            input.productId,
          ),
        );
        if (error) {
          throw errorMap(error);
        }

        return product;
      }),
  },

  mutations: {
    update: adminProcedure
      .input(updateProductVariantInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data: variant, error } = await tryCatch(
          ctx.app.admin.productVariants.mutations.update(input),
        );

        if (error) {
          throw errorMap(error);
        }

        return variant;
      }),
  },
});
