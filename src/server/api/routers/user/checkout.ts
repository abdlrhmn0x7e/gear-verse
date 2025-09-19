import { DB } from "~/server/repositories";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { phoneNumberSchema } from "~/lib/schemas/phone-number";
import { addressGovernoratesEnum } from "~/lib/schemas/address";

export const userCheckoutRouter = createTRPCRouter({
  complete: protectedProcedure
    .input(
      z.object({
        paymentMethod: z.enum(["COD"]),
        phoneNumber: phoneNumberSchema,
        address: z.object({
          address: z.string(),
          city: z.string(),
          governorate: addressGovernoratesEnum,
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // validate cart
      const cart = await DB.user.carts.queries.find(
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

      const itemsStock = await DB.user.productVariants.queries.getItemsStock(
        cart.items.map((item) => item.productVariant.id),
      );

      const quantityMap = new Map<number, number>();
      for (const item of cart.items) {
        quantityMap.set(item.productVariant.id, item.quantity);
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

      // create an address
      const address = await DB.user.addresses.mutations.create({
        userId: Number(ctx.session.user.id),
        ...input.address,
      });
      if (!address) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create address",
        });
      }

      // create an order, order items and clear the cart
      const order = await DB.user.orders.mutations.create(
        {
          userId: Number(ctx.session.user.id),
          phoneNumber: input.phoneNumber,
          paymentMethod: input.paymentMethod,
          addressId: address.id,
        },
        cart.items.map((item) => ({
          productVariantId: item.productVariant.id,
          quantity: item.quantity,
        })),
        cart.id,
      );
      if (!order) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
        });
      }

      return order;
    }),
});
