import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { asc } from "drizzle-orm";

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
};
