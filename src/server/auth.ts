import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db";
import { admin, anonymous, jwt } from "better-auth/plugins";
import { mcp } from "@better-auth/mcp";
import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { nextCookies } from "better-auth/next-js";
import { data } from "./data-access";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { invalidateCache } from "./actions/cache";

/** The MCP endpoint admins paste into ChatGPT or Claude; access tokens are issued for this audience only. */
export const mcpResource = `${env.NEXT_PUBLIC_APP_URL}/api/mcp`;

export function isActiveAdmin(user: Record<string, unknown>) {
  return user.role === "admin" && user.banned !== true;
}

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  // the jwt plugin's /token hands out a JWT for any session cookie; OAuth clients get theirs from /oauth2/token
  disabledPaths: ["/token"],
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
    jwt(),
    mcp({
      resource: mcpResource,
      scopes: ["openid", "profile", "email", "offline_access", "catalog"],
      // no client_credentials: every token acts for a signed in admin
      grantTypes: ["authorization_code", "refresh_token"],
      accessTokenExpiresIn: 15 * 60,
      // for clients without Client ID Metadata Documents; native ones (localhost callbacks) are inferred
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      clientRegistrationDefaultApplicationType: "infer",
      loginPage: "/connect/sign-in",
      consentPage: "/connect/consent",
      schema: {
        oauthClient: { modelName: "oauthClients" },
        oauthResource: { modelName: "oauthResources" },
        oauthClientResource: { modelName: "oauthClientResources" },
        oauthRefreshToken: { modelName: "oauthRefreshTokens" },
        oauthAccessToken: { modelName: "oauthAccessTokens" },
        oauthConsent: { modelName: "oauthConsents" },
        oauthClientAssertion: { modelName: "oauthClientAssertions" },
      },
      // guests browse with anonymous sessions, which have to sign in for real
      selectAccount: {
        shouldRedirect: ({ user }) => user.isAnonymous === true,
      },
      postLogin: {
        page: "/connect/denied",
        shouldRedirect: ({ user }) => !isActiveAdmin(user),
        consentReferenceId: () => undefined,
      },
    }),
    cimd({ fetchClientMetadataResource, metadataProfile: "mcp-2026-07-28" }),
    // last, so cookies set by the other plugins' after hooks reach Next's cookie store
    nextCookies(),
  ],
});

// better-auth checks its cookie cache against Date.now(). With partialPrefetching, headers() also resolves while a
// prefetch is prerendered, so the session read waits for the real request instead of reading the clock there.
export async function getSession() {
  await connection();
  return auth.api.getSession({ headers: await headers() });
}

export async function requireAuth() {
  "use server";

  const session = await getSession();

  if (!session) {
    return notFound();
  }
}

export async function requireAdmin() {
  "use server";

  const session = await getSession();

  if (session?.user.role !== "admin") {
    return notFound();
  }
}
