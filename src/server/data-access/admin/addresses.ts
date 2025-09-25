import { db } from "~/server/db";
import { addresses } from "~/server/db/schema";

type NewAddress = typeof addresses.$inferInsert;

export const _adminAddressesRepo = {
  mutations: {
    create: async (input: NewAddress) => {
      const [address] = await db
        .insert(addresses)
        .values(input)
        .onConflictDoUpdate({
          target: [addresses.userId],
          set: input,
        })
        .returning({ id: addresses.id });

      return address;
    },
  },
};
