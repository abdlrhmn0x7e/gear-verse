import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { asc, eq } from "drizzle-orm";

export const _users = {
  queries: {
    findAll: async () => {
      return db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        })
        .from(users)
        .orderBy(asc(users.name));
    },
  },

  mutations: {
    delete: async (id: number) => {
      return db
        .delete(users)
        .where(eq(users.id, id))
        .then(([res]) => res);
    },
  },
};
