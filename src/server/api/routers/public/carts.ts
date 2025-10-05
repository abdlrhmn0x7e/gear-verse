import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { newCartItemSchema } from "~/lib/schemas/entities/cart";
import z from "zod";

export const userCartsRouter = createTRPCRouter({
  queries: {
    find: protectedProcedure.query(async ({ ctx }) => {
      const { data: cart, error } = await tryCatch(
        ctx.app.public.carts.queries.find(Number(ctx.session.user.id)),
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
          ctx.app.public.carts.mutations.addItem(
            Number(ctx.session.user.id),
            input,
          ),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    removeItem: protectedProcedure
      .input(z.object({ productVariantId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.carts.mutations.removeItem(
            Number(ctx.session.user.id),
            input.productVariantId,
          ),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },
});
