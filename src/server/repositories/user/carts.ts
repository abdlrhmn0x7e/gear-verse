import { db } from "~/server/db";
import { carts } from "~/server/db/schema/carts";
import { eq } from "drizzle-orm";

type NewCart = typeof carts.$inferInsert;

export const _cartsRepository = {
  queries: {
    find: async (userId: number) => {
      return db.select().from(carts).where(eq(carts.userId, userId));
    },
  },

  mutations: {
    create: async (cart: NewCart) => {
      return db.insert(carts).values(cart).returning();
    },
  },
};
