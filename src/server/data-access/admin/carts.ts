import { db } from "~/server/db";
import { carts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const _carts = {
  mutations: {
    associateWithUser: async (cartId: number, userId: number) => {
      return db
        .update(carts)
        .set({ userId })
        .where(eq(carts.id, cartId))
        .returning({ id: carts.id })
        .then(([res]) => res);
    },

    moveOwnership: async (oldUserId: number, newUserId: number) => {
      // remove any existing cart for the new user
      await db.delete(carts).where(eq(carts.userId, newUserId));

      // move the ownership
      return db
        .update(carts)
        .set({ userId: newUserId })
        .where(eq(carts.userId, oldUserId))
        .then(([res]) => res);
    },
  },
};
