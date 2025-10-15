import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { newCartItemSchema } from "~/lib/schemas/entities/cart";
import z from "zod";

export const userCartsRouter = createTRPCRouter({
  queries: {
    find: protectedProcedure.query(async ({ ctx }) => {
      const parsedUserId = Number(ctx.session.user.id);

      const { data: cart, error } = await tryCatch(
        ctx.app.public.carts.queries.find(parsedUserId),
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
        const parsedUserId = Number(ctx.session.user.id);

        const { data, error } = await tryCatch(
          ctx.app.public.carts.mutations.addItem({
            userId: parsedUserId,
            item: input,
          }),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    removeItem: protectedProcedure
      .input(z.object({ productVariantId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const parsedUserId = Number(ctx.session.user.id);

        const { data, error } = await tryCatch(
          ctx.app.public.carts.mutations.removeItem({
            userId: parsedUserId,
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
