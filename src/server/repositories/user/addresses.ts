import { db } from "~/server/db";
import { addresses } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type NewAddress = typeof addresses.$inferInsert;

export const _userAddressesRepository = {
  queries: {
    find: async (userId: number) => {
      return db
        .select({
          address: addresses.address,
          city: addresses.city,
          governorate: addresses.governorate,
        })
        .from(addresses)
        .where(eq(addresses.userId, userId))
        .limit(1)
        .then((res) => res[0]);
    },
  },

  mutations: {
    create: async (input: NewAddress) => {
      return db
        .insert(addresses)
        .values(input)
        .returning({ id: addresses.id })
        .onConflictDoUpdate({
          target: [addresses.userId],
          set: input,
        })
        .then((res) => res[0]);
    },
  },
};
