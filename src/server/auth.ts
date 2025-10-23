import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db";
import { admin, anonymous } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { addresses, carts, orders, users } from "./db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    modelName: "users",
  },
  session: {
    modelName: "sessions",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },

  advanced: {
    database: {
      generateId: false,
      useNumberId: true,
    },
  },

  plugins: [
    nextCookies(),
    admin(),
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const parsedAnonymousUserId = Number(anonymousUser.user.id);
        const parsedNewUserId = Number(newUser.user.id);

        // move ownerships
        await db.transaction(async (tx) => {
          // delete existing cart for the new user
          await tx.delete(carts).where(eq(carts.userId, parsedNewUserId));

          // move ownerships
          await tx
            .update(carts)
            .set({ userId: parsedNewUserId })
            .where(eq(carts.userId, parsedAnonymousUserId));
          await tx
            .update(addresses)
            .set({ userId: parsedNewUserId })
            .where(eq(addresses.userId, parsedAnonymousUserId));
          await tx
            .update(orders)
            .set({ userId: parsedNewUserId })
            .where(eq(orders.userId, parsedAnonymousUserId));

          // delete the anonymous user
          await tx.delete(users).where(eq(users.id, parsedAnonymousUserId));
        });
      },

      disableDeleteAnonymousUser: true,
    }),
  ],
});

export async function requireAdmin() {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    return notFound();
  }
}
