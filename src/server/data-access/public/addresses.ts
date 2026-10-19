import { db } from "~/server/db";
import { addresses } from "~/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

type NewAddress = typeof addresses.$inferInsert;

export const _addresses = {
  queries: {
    findAll: async ({ userId }: { userId: number }) => {
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
        .where(and(eq(addresses.userId, userId), isNull(addresses.deletedAt)));
    },

    findOwned: async ({ id, userId }: { id: number; userId: number }) => {
      return db
        .select({ id: addresses.id })
        .from(addresses)
        .where(
          and(
            eq(addresses.id, id),
            eq(addresses.userId, userId),
            isNull(addresses.deletedAt),
          ),
        )
        .limit(1)
        .then(([res]) => res ?? null);
    },
  },

  mutations: {
    create: async (input: NewAddress) => {
      return db
        .insert(addresses)
        .values(input)
        .returning({ id: addresses.id })
        .then(([res]) => res);
    },

    softDelete: async ({ id, userId }: { id: number; userId: number }) => {
      return db
        .update(addresses)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(addresses.id, id),
            eq(addresses.userId, userId),
            isNull(addresses.deletedAt),
          ),
        )
        .returning({ id: addresses.id })
        .then(([res]) => res ?? null);
    },
  },
};
