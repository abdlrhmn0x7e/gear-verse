import { createTRPCRouter, protectedProcedure } from "~/server/api/init";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { newCartItemSchema } from "~/lib/schemas/entities/cart";
import z from "zod";

export const userCartsRouter = createTRPCRouter({
  queries: {
    find: protectedProcedure.query(async ({ ctx }) => {
      const { data: cart, error } = await tryCatch(
        ctx.app.public.carts.queries.find(ctx.user.id),
      );
      if (error) {
        throw errorMap(error);
      }

      return cart;
    }),
  },

  mutations: {
    addItem: protectedProcedure
      .input(newCartItemSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.carts.mutations.addItem({
            userId: ctx.user.id,
            item: input,
          }),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    removeItem: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          productVariantId: z.number().nullable(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.carts.mutations.removeItem({
            userId: ctx.user.id,
            productId: input.productId,
            productVariantId: input.productVariantId,
          }),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },
});
