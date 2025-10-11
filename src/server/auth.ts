import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db";
import { admin, createAuthMiddleware } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { data } from "./data-access";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "~/lib/constants";

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

  hooks: {
    // associate the cart with the user if the user signed up or signed in
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up") || ctx.path.startsWith("/sign-in")) {
        const cookieStore = await cookies();
        const cookieName = CART_COOKIE_NAME;

        const cartId = cookieStore.get(cookieName)?.value;
        const parsedCartId = isNaN(Number(cartId)) ? undefined : Number(cartId);

        const userId = ctx.context.session?.user.id;
        const parsedUserId = isNaN(Number(userId)) ? undefined : Number(userId);

        if (!parsedCartId || !parsedUserId) {
          return;
        }

        await data.public.carts.mutations.associateWithUser(
          parsedCartId,
          parsedUserId,
        );
      }
    }),
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

  plugins: [nextCookies(), admin()],
});
