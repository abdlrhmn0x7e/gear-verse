import { createTRPCRouter, protectedProcedure } from "../../trpc";
import z from "zod";
import { TRPCError } from "@trpc/server";

export const userCartsRouter = createTRPCRouter({
  find: protectedProcedure.query(async ({ ctx }) => {
    const cart = await ctx.db.user.carts.queries.find(
      Number(ctx.session.user.id),
    );
    if (!cart) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cart not found",
      });
    }

    return cart;
  }),

  addItem: protectedProcedure
    .input(
      z.object({
        productVariantId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let cart = await ctx.db.user.carts.queries.findCartId(
        Number(ctx.session.user.id),
      );
      cart ??= await ctx.db.user.carts.mutations.create({
        userId: Number(ctx.session.user.id),
      }); // Create cart if it doesn't exist

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      return ctx.db.user.carts.mutations.addItem({
        cartId: cart.id,
        productVariantId: input.productVariantId,
      });
    }),

  removeItem: protectedProcedure
    .input(
      z.object({
        productVariantId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.db.user.carts.queries.findCartId(
        Number(ctx.session.user.id),
      );
      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      return ctx.db.user.carts.mutations.removeItem(
        cart.id,
        input.productVariantId,
      );
    }),
});
