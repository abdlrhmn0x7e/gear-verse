import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { newCartItemSchema } from "~/lib/schemas/entities/cart";
import z from "zod";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "~/lib/constants";
import { env } from "~/env";

export const userCartsRouter = createTRPCRouter({
  queries: {
    find: publicProcedure.query(async ({ ctx }) => {
      const cookieStore = await cookies();

      const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
      const userId = ctx.session?.user.id;

      const parsedCartId = isNaN(Number(cartId)) ? undefined : Number(cartId);
      const parsedUserId = isNaN(Number(userId)) ? undefined : Number(userId);

      const { data: cart, error } = await tryCatch(
        ctx.app.public.carts.queries.find({
          cartId: parsedCartId,
          userId: parsedUserId,
        }),
      );
      if (error) {
        throw errorMap(error);
      }

      if (!parsedCartId) {
        cookieStore.set(CART_COOKIE_NAME, cart.id.toString(), {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });
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
