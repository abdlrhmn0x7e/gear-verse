import { createTRPCRouter, protectedProcedure } from "~/server/api/init";
import { TRPCError } from "@trpc/server";
import { createAddressInputSchema } from "~/lib/schemas/entities/address";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { checkoutInputSchema } from "~/lib/schemas/contracts/public/checkout";

export const userCheckoutRouter = createTRPCRouter({
  queries: {
    getAddresses: protectedProcedure.query(async ({ ctx }) => {
      const { data: addresses, error } = await tryCatch(
        ctx.app.public.checkout.queries.getAddresses({
          userId: ctx.user.id,
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
        const { data, error } = await tryCatch(
          ctx.app.public.checkout.mutations.addAddress(input, ctx.user.id),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    complete: protectedProcedure
      .input(checkoutInputSchema)
      .mutation(async ({ ctx, input }) => {
        // the address must be one of the customer's own saved addresses
        const { data: isOwnedAddress, error: findAddressError } =
          await tryCatch(
            ctx.app.public.checkout.queries.isOwnedAddress({
              addressId: input.addressId,
              userId: ctx.user.id,
            }),
          );
        if (findAddressError) {
          throw errorMap(findAddressError);
        }

        if (!isOwnedAddress) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please choose one of your saved addresses",
          });
        }

        // validate cart
        const { data: cart, error: findCartError } = await tryCatch(
          ctx.app.public.carts.queries.find(ctx.user.id),
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

        const unavailable = cart.items.find((item) => !item.available);
        if (unavailable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${unavailable.title} is no longer available, please remove it from your cart`,
          });
        }

        const { data: itemsStock, error: getItemsStockError } = await tryCatch(
          ctx.app.public.carts.queries.getItemsStock(
            cart.items.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
            })),
          ),
        );
        if (getItemsStockError) {
          throw errorMap(getItemsStockError);
        }

        const cartItemsMap = new Map(
          cart.items.map((item) => [
            `${item.productId}-${item.productVariantId}`,
            item,
          ]),
        );
        for (const item of itemsStock) {
          const cartItem = cartItemsMap.get(
            `${item.productId}-${item.productVariantId}`,
          );
          if (cartItem && cartItem.quantity > item.stock) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                item.stock > 0
                  ? `Insufficient stock for ${cartItem.title}: only ${item.stock} left`
                  : `Insufficient stock for ${cartItem.title}: it is out of stock`,
            });
          }
        }

        // create an order, order items and clear the cart
        const { data: order, error: createOrderError } = await tryCatch(
          ctx.app.public.checkout.mutations.create({
            cartId: cart.id,
            input: {
              userId: ctx.user.id,
              paymentMethod: input.paymentMethod,
              addressId: input.addressId,
              status: "PENDING",
            },
            items: cart.items.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
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
