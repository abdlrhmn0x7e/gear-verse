import { db } from "~/server/db";
import { addresses } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type NewAddress = typeof addresses.$inferInsert;

export const _userAddressesRepository = {
  queries: {
    find: async (userId: number) => {
      return db.select().from(addresses).where(eq(addresses.userId, userId));
    },
  },

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
