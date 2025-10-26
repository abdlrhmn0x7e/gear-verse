import { revalidateTag } from "next/cache";
import { AppError } from "~/lib/errors/app-error";
import type { CreateAddressInput } from "~/lib/schemas/entities/address";
import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from "~/lib/schemas/entities/order";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";

export const _checkout = {
  queries: {
    getAddresses: async ({ userId }: { userId: number }) => {
      const { data: addresses, error } = await tryCatch(
        data.public.addresses.queries.findAll({
          userId,
        }),
      );
      if (error || !addresses) {
        throw new AppError("Address not found", "NOT_FOUND", {
          cause: error,
        });
      }

      return addresses;
    },
  },

  mutations: {
    addAddress: async (input: CreateAddressInput, userId: number) => {
      const { data: address, error } = await tryCatch(
        data.public.addresses.mutations.create({
          userId,
          ...input,
        }),
      );
      if (error || !address) {
        throw new AppError("Failed to add address", "INTERNAL", {
          cause: error,
        });
      }

      return address;
    },

    create: async ({
      userId,
      cartId,
      input,
      items,
    }: {
      userId: number;
      cartId: number;
      input: CreateOrderInput;
      items: CreateOrderItemInput[];
    }) => {
      const { data: order, error } = await tryCatch(
        data.public.orders.mutations.create(
          { ...input, userId },
          items,
          cartId,
        ),
      );

      if (error) {
        throw new AppError("Failed to create order", "INTERNAL", {
          cause: error,
        });
      }

      // Revalidate product pages to update stock info
      for (const item of items) {
        revalidateTag(`product-${item.productId}`, "max");
      }

      return order;
    },
  },
};
