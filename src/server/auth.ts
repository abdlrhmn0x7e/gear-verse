import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db";
import { admin, anonymous } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { data } from "./data-access";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { invalidateCache } from "./actions/cache";

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

  onAPIError: {
    throw: false,
    errorURL: "/",
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

  databaseHooks: {
    user: {
      create: {
        // the landing page lists the latest customers, so a real sign up
        // (not an anonymous visitor) has to show up there
        after: async (user) => {
          if (user.isAnonymous !== true) {
            await invalidateCache("customer-summary");
          }
        },
      },
    },
  },

  advanced: {
    database: {
      generateId: false,
      useNumberId: true,
    },
  },

  plugins: [
    nextCookies(),
    admin({
      schema: {
        user: {
          fields: {
            banExpires: "banExpiresAt",
          },
        },
      },
    }),
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const parsedAnonymousUserId = Number(anonymousUser.user.id);
        const parsedNewUserId = Number(newUser.user.id);

        // merge the guest cart, reviews, addresses and orders into the
        // account, then delete the anonymous user
        await data.public.users.mutations.mergeAnonymous(
          parsedAnonymousUserId,
          parsedNewUserId,
        );
      },

      disableDeleteAnonymousUser: true,
    }),
  ],
});

export async function requireAuth() {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return notFound();
  }
}

export async function requireAdmin() {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    return notFound();
  }
}
