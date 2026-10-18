import { db } from "~/server/db";
import { addresses } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type NewAddress = typeof addresses.$inferInsert;

export const _addresses = {
  queries: {
    findByUserId: async ({ userId }: { userId: number }) => {
      return db
        .select({
          id: addresses.id,
          fullName: addresses.fullName,
          phoneNumber: addresses.phoneNumber,
          address: addresses.address,
          buildingNameOrNumber: addresses.buildingNameOrNumber,
          city: addresses.city,
          governorate: addresses.governorate,
          latitude: addresses.latitude,
          longitude: addresses.longitude,
        })
        .from(addresses)
        .where(eq(addresses.userId, userId));
    },

    findOwnerId: async (id: number) => {
      return db
        .select({ userId: addresses.userId })
        .from(addresses)
        .where(eq(addresses.id, id))
        .limit(1)
        .then(([res]) => res?.userId);
    },
  },

  mutations: {
    create: async (input: NewAddress) => {
      const [address] = await db
        .insert(addresses)
        .values(input)
        .returning({ id: addresses.id });

      return address;
    },
    moveOwnership: async (oldUserId: number, newUserId: number) => {
      return db
        .update(addresses)
        .set({ userId: newUserId })
        .where(eq(addresses.userId, oldUserId))
        .returning({ id: addresses.id })
        .then(([res]) => res);
    },
  },
};
