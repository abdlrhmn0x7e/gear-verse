import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { and, asc, count, desc, eq, gt, ilike, lt } from "drizzle-orm";
import type { Pagination } from "../common/types";
import type { CreateUserInput } from "~/lib/schemas/entities/users";

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

    getPage: async ({
      cursor,
      pageSize,
      filters,
    }: Pagination<{ name: string }>) => {
      const whereClause = cursor
        ? [lt(users.id, cursor), eq(users.isAnonymous, false)]
        : [eq(users.isAnonymous, false)];
      if (filters?.name) {
        whereClause.push(ilike(users.name, `%${filters.name}%`));
      }

      return db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        })
        .from(users)
        .where(and(...whereClause))
        .limit(pageSize + 1)
        .orderBy(desc(users.id));
    },

    getCount: async () => {
      return db.$count(users);
    },
  },

  mutations: {
    create: async (input: CreateUserInput) => {
      return db
        .insert(users)
        .values(input)
        .returning({ id: users.id })
        .then(([res]) => res);
    },

    delete: async (id: number) => {
      return db
        .delete(users)
        .where(eq(users.id, id))
        .then(([res]) => res);
    },
  },
};
