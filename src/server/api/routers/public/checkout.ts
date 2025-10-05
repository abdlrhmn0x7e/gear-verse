import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { createAddressInputSchema } from "~/lib/schemas/entities/address";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { checkoutInputSchema } from "~/lib/schemas/contracts/public/checkout";

export const userCheckoutRouter = createTRPCRouter({
  queries: {
    getAddresses: protectedProcedure.query(async ({ ctx }) => {
      const { data: addresses, error } = await tryCatch(
        ctx.app.public.checkout.queries.getAddresses(
          Number(ctx.session.user.id),
        ),
      );
      if (error) {
        throw errorMap(error);
      }

      return addresses;
    }),
  },

  mutations: {
    addAddress: protectedProcedure
      .input(createAddressInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.checkout.mutations.addAddress(
            input,
            Number(ctx.session.user.id),
          ),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
    complete: protectedProcedure
      .input(checkoutInputSchema)
      .mutation(async ({ ctx, input }) => {
        // validate cart
        const cart = await ctx.app.public.carts.queries.find(
          Number(ctx.session.user.id),
        );
        if (!cart) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }

        if (cart.items.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cart is empty",
          });
        }

        const itemsStock = await ctx.app.public.carts.queries.getItemsStock(
          cart.items.map((item) => item.id),
        );

        const quantityMap = new Map<number, number>();
        for (const item of cart.items) {
          quantityMap.set(item.id, item.quantity);
        }
        for (const item of itemsStock) {
          const quantity = quantityMap.get(item.id);
          if (quantity && quantity > item.stock) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Insufficient stock",
            });
          }
        }

        // create an order, order items and clear the cart
        const order = await ctx.app.public.checkout.mutations.create(
          cart.id,
          Number(ctx.session.user.id),
          {
            paymentMethod: input.paymentMethod,
            addressId: input.addressId,
            status: "PENDING",
          },
          cart.items.map((item) => ({
            productVariantId: item.id,
            quantity: item.quantity,
          })),
        );
        if (!order) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order",
          });
        }

        return order;
      }),
  },
});
