import { AppError } from "~/lib/errors/app-error";
import type { CreateAddressInput } from "~/lib/schemas/entities/address";
import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from "~/lib/schemas/entities/order";
import { data } from "~/server/data-access";

export const _checkout = {
  queries: {
    getAddresses: async (userId: number) => {
      const addresses = await data.public.addresses.queries.findAll(userId);
      if (!addresses) {
        throw new AppError("Address not found", "NOT_FOUND");
      }

      return addresses;
    },
  },

  mutations: {
    addAddress: async (input: CreateAddressInput, userId: number) => {
      return data.public.addresses.mutations.create({
        userId,
        ...input,
      });
    },

    create: async (
      userId: number,
      cartId: number,
      input: CreateOrderInput,
      items: CreateOrderItemInput[],
    ) => {
      return data.public.orders.mutations.create(
        { ...input, userId },
        items,
        cartId,
      );
    },
  },
};
