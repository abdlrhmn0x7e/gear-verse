import { AppError } from "~/lib/errors/app-error";
import type { CreateAddressInput } from "~/lib/schemas/entities/address";
import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from "~/lib/schemas/entities/order";
import { tryCatch } from "~/lib/utils/try-catch";
import { invalidateProducts } from "~/server/actions/cache";
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

    isOwnedAddress: async ({
      addressId,
      userId,
    }: {
      addressId: number;
      userId: number;
    }) => {
      const { data: address, error } = await tryCatch(
        data.public.addresses.queries.findOwned({ id: addressId, userId }),
      );
      if (error) {
        throw new AppError("Failed to find address", "INTERNAL", {
          cause: error,
        });
      }

      return address !== null;
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
      cartId,
      input,
      items,
    }: {
      cartId: number;
      /** a saved address id, or a new address saved in the same transaction */
      input: Omit<CreateOrderInput, "addressId"> & {
        address: number | CreateAddressInput;
      };
      items: CreateOrderItemInput[];
    }) => {
      const { data: order, error } = await tryCatch(
        data.public.orders.mutations.create(input, items, cartId),
      );

      if (error) {
        throw new AppError("Failed to create order", "INTERNAL", {
          cause: error,
        });
      }

      // Invalidate product pages and listings to update stock info
      await invalidateProducts(items.map((item) => item.productId));

      return order;
    },
  },
};
