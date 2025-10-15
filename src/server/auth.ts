import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db";
import { admin, anonymous } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { data } from "./data-access";
import { tryCatch } from "~/lib/utils/try-catch";

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

        // move cart ownership
        const ownershipPromises = [
          data.public.carts.mutations.moveOwnership(
            parsedAnonymousUserId,
            parsedNewUserId,
          ),
          data.public.addresses.mutations.moveOwnership(
            parsedAnonymousUserId,
            parsedNewUserId,
          ),

          data.public.orders.mutations.moveOwnership(
            parsedAnonymousUserId,
            parsedNewUserId,
          ),
        ];

        const { error } = await tryCatch(Promise.all(ownershipPromises));
        if (error) {
          console.error("Error moving ownership", error);
        }
      },
    }),
  ],
});
