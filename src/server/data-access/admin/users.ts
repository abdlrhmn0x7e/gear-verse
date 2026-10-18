import { db } from "~/server/db";
import { orders, sessions, users } from "~/server/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  lt,
  not,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { Pagination } from "../common/types";
import type { CreateUserInput } from "~/lib/schemas/entities/users";
import type { UserRole, UserStatus } from "~/lib/schemas/contracts/admin/users";

/** Registered accounts only: guest checkouts make anonymous users. */
const isRegistered = sql`${users.isAnonymous} is not true`;

/** A ban counts until it expires; better-auth lifts expired ones on next sign-in. */
const isBanned = sql<boolean>`(${users.banned} is true and (${users.banExpiresAt} is null or ${users.banExpiresAt} > now()))`;

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

    /**
     * Registered users for the admin list, newest first, with how many orders
     * each placed and when a session of theirs was last used.
     */
    getManagePage: async ({
      cursor,
      pageSize,
      filters,
    }: Pagination<{ search: string; role: UserRole; status: UserStatus }>) => {
      const where: SQL[] = [isRegistered];
      if (cursor) {
        where.push(lt(users.id, cursor));
      }
      if (filters?.search) {
        const pattern = `%${filters.search}%`;
        where.push(
          or(ilike(users.name, pattern), ilike(users.email, pattern))!,
        );
      }
      if (filters?.role === "admin") {
        where.push(eq(users.role, "admin"));
      } else if (filters?.role === "user") {
        where.push(sql`coalesce(${users.role}, 'user') <> 'admin'`);
      }
      if (filters?.status === "banned") {
        where.push(isBanned);
      } else if (filters?.status === "active") {
        where.push(not(isBanned));
      }

      return db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          role: sql<string>`coalesce(${users.role}, 'user')`,
          banned: isBanned,
          banReason: users.banReason,
          banExpiresAt: users.banExpiresAt,
          createdAt: users.createdAt,
          orderCount:
            sql<number>`(select count(*) from ${orders} where ${orders.userId} = ${users.id})`.mapWith(
              Number,
            ),
          lastActiveAt:
            sql<Date | null>`(select max(${sessions.updatedAt}) from ${sessions} where ${sessions.userId} = ${users.id})`.mapWith(
              sessions.updatedAt,
            ),
        })
        .from(users)
        .where(and(...where))
        .limit(pageSize + 1)
        .orderBy(desc(users.id));
    },

    /** A registered user, for checks before changing them. */
    findRegisteredById: async (id: number) => {
      return db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(and(eq(users.id, id), isRegistered))
        .then(([user]) => user ?? null);
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
