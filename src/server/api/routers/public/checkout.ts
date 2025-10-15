import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { createAddressInputSchema } from "~/lib/schemas/entities/address";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { checkoutInputSchema } from "~/lib/schemas/contracts/public/checkout";

export const userCheckoutRouter = createTRPCRouter({
  queries: {
    getAddresses: protectedProcedure.query(async ({ ctx }) => {
      const parsedUserId = Number(ctx.session.user.id);

      const { data: addresses, error } = await tryCatch(
        ctx.app.public.checkout.queries.getAddresses({
          userId: parsedUserId,
        }),
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
        const parsedUserId = Number(ctx.session.user.id);

        const { data, error } = await tryCatch(
          ctx.app.public.checkout.mutations.addAddress(input, parsedUserId),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    complete: protectedProcedure
      .input(checkoutInputSchema)
      .mutation(async ({ ctx, input }) => {
        const parsedUserId = Number(ctx.session.user.id);

        // validate cart
        const { data: cart, error: findCartError } = await tryCatch(
          ctx.app.public.carts.queries.find(parsedUserId),
        );

        if (findCartError) {
          throw errorMap(findCartError);
        }

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

        const { data: itemsStock, error: getItemsStockError } = await tryCatch(
          ctx.app.public.carts.queries.getItemsStock(
            cart.items.map((item) => item.id),
          ),
        );
        if (getItemsStockError) {
          throw errorMap(getItemsStockError);
        }

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
        const { data: order, error: createOrderError } = await tryCatch(
          ctx.app.public.checkout.mutations.create({
            userId: parsedUserId,
            cartId: cart.id,
            input: {
              paymentMethod: input.paymentMethod,
              addressId: input.addressId,
              status: "PENDING",
            },
            items: cart.items.map((item) => ({
              productVariantId: item.id,
              quantity: item.quantity,
            })),
          }),
        );

        if (createOrderError) {
          throw errorMap(createOrderError);
        }

        return order;
      }),
  },
});
