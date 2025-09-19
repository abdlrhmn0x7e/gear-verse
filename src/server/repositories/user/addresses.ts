import { db } from "~/server/db";
import { addresses } from "~/server/db/schema";

type NewAddress = typeof addresses.$inferInsert;

export const _userAddressesRepository = {
  mutations: {
    create: async (input: NewAddress) => {
      return db
        .insert(addresses)
        .values(input)
        .returning({ id: addresses.id })
        .then((res) => res[0]);
    },
  },
};
