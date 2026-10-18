import { isAPIError } from "better-auth/api";
import { data } from "~/server/data-access";
import { auth } from "~/server/auth";
import { paginate } from "../helpers/pagination";
import { AppError } from "~/lib/errors/app-error";
import { tryCatch } from "~/lib/utils/try-catch";
import {
  banDurations,
  type BanUserInput,
  type SetUserRoleInput,
  type UserIdInput,
  type UsersGetManagePageInput,
  type UsersGetPageInput,
} from "~/lib/schemas/contracts";
import type { CreateUserInput } from "~/lib/schemas/entities/users";

/** The signed-in admin making the change, and their request's headers for better-auth. */
type Actor = { id: number; headers: Headers };

async function requireRegisteredUser(userId: number) {
  const user = await data.admin.users.queries.findRegisteredById(userId);
  if (!user) {
    throw new AppError("User not found", "NOT_FOUND");
  }
  return user;
}

/** better-auth rejects with an APIError; its message is meant for people. */
async function callAuth<T>(call: Promise<T>, fallback: string) {
  const { data: result, error } = await tryCatch(call);
  if (error) {
    throw isAPIError(error)
      ? new AppError(error.message || fallback, "BAD_REQUEST", undefined, error)
      : new AppError(fallback, "INTERNAL", undefined, error);
  }
  return result;
}

export const _users = {
  queries: {
    getPage: async (input: UsersGetPageInput) => {
      return paginate({
        input,
        getPage: data.admin.users.queries.getPage,
      });
    },

    getManagePage: async (input: UsersGetManagePageInput, actorId: number) => {
      const page = await paginate({
        input,
        getPage: data.admin.users.queries.getManagePage,
      });

      return {
        ...page,
        // The list offers no actions on the admin's own row.
        data: page.data.map((user) => ({
          ...user,
          isSelf: user.id === actorId,
        })),
      };
    },

    /** A user's most recent orders, newest first. */
    getOrders: async ({ userId }: UserIdInput) => {
      await requireRegisteredUser(userId);
      return data.public.orders.queries.getPage({ userId, pageSize: 20 });
    },

    getCount: async () => {
      return data.admin.users.queries.getCount();
    },
  },

  mutations: {
    create: async (input: CreateUserInput) => {
      return data.admin.users.mutations.create(input);
    },

    setRole: async ({ userId, role }: SetUserRoleInput, actor: Actor) => {
      if (userId === actor.id && role !== "admin") {
        throw new AppError(
          "You can't remove your own admin role",
          "BAD_REQUEST",
        );
      }
      await requireRegisteredUser(userId);

      await callAuth(
        auth.api.setRole({
          body: { userId: String(userId), role },
          headers: actor.headers,
        }),
        "Could not change the role",
      );

      return { id: userId, role };
    },

    /** Bans the user and signs them out everywhere. */
    ban: async ({ userId, reason, duration }: BanUserInput, actor: Actor) => {
      if (userId === actor.id) {
        throw new AppError("You can't ban yourself", "BAD_REQUEST");
      }
      await requireRegisteredUser(userId);

      // better-auth's banUser also deletes every session the user has.
      await callAuth(
        auth.api.banUser({
          body: {
            userId: String(userId),
            banReason: reason || undefined,
            banExpiresIn: banDurations[duration] ?? undefined,
          },
          headers: actor.headers,
        }),
        "Could not ban the user",
      );

      return { id: userId };
    },

    unban: async ({ userId }: UserIdInput, actor: Actor) => {
      await requireRegisteredUser(userId);

      await callAuth(
        auth.api.unbanUser({
          body: { userId: String(userId) },
          headers: actor.headers,
        }),
        "Could not unban the user",
      );

      return { id: userId };
    },
  },
};
