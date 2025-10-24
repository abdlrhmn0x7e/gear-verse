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

        const { data: itemsStock, error: getItemsStockError } = await tryCatch(
          ctx.app.public.carts.queries.getItemsStock(
            cart.items.map((item) => ({
              productId: item.productId,
              productVariantId: item.id,
            })),
          ),
        );
        if (getItemsStockError) {
          throw errorMap(getItemsStockError);
        }

        const quantityMap = new Map<string, number>();
        for (const item of cart.items) {
          quantityMap.set(
            `${item.productId}-${item.productVariantId}`,
            item.quantity,
          );
        }
        for (const item of itemsStock) {
          const quantity = quantityMap.get(
            `${item.productId}-${item.productVariantId}`,
          );
          if (quantity && quantity > item.stock) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Insufficient stock for product ${item.productId} - ${item.productVariantId}`,
            });
          }
        }

        // create an order, order items and clear the cart
        const { data: order, error: createOrderError } = await tryCatch(
          ctx.app.public.checkout.mutations.create({
            userId: ctx.user.id,
            cartId: cart.id,
            input: {
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
