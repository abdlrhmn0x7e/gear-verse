import type { CreateAddressInput } from "~/lib/schemas/entities";
import { data } from "~/server/data-access";

export const _addresses = {
  queries: {
    findByUserId: async ({ userId }: { userId: number }) => {
      return data.admin.addresses.queries.findByUserId({ userId });
    },
  },

  mutations: {
    create: async (input: CreateAddressInput & { userId: number }) => {
      return data.admin.addresses.mutations.create(input);
    },
  },
};
