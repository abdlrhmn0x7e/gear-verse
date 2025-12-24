import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import * as Sentry from "@sentry/node";

import { auth } from "../auth";
import { app } from "../application";
import { ratelimit } from "../ratelimit";
import { cache } from "react";
import { headers } from "next/headers";

/**
 * Get client IP address from request headers.
 * Checks common headers set by proxies/load balancers.
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "anonymous"
  );
}

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */

  return {
    app,
  };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

const authMiddleware = t.middleware(async ({ next, ctx }) => {
  const data = await auth.api.getSession({ headers: await headers() });
  const user = data?.user
    ? {
        id: parseInt(data.user.id),
        role: data.user.role,
      }
    : null;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

const adminMiddleware = t.middleware(async ({ next, ctx }) => {
  const data = await auth.api.getSession({ headers: await headers() });
  const user = data?.user
    ? {
        id: parseInt(data.user.id),
        role: data.user.role,
      }
    : null;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  if (user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx: { ...ctx, user } });
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

/**
 * Rate limit middleware for public/anonymous requests.
 * Uses IP address as identifier. 30 requests per minute.
 */
const publicRateLimitMiddleware = t.middleware(async ({ next }) => {
  if (!ratelimit) {
    return next();
  }

  const ip = await getClientIp();
  const { success, reset } = await ratelimit.public.limit(ip);

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again at ${new Date(reset).toISOString()}`,
    });
  }

  return next();
});

/**
 * Rate limit middleware for authenticated users.
 * Uses user ID as identifier. 100 requests per minute.
 */
const protectedRateLimitMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ratelimit) {
    return next({ ctx });
  }

  const typedCtx = ctx as { user?: { id: number } };
  const identifier = typedCtx.user?.id?.toString() ?? (await getClientIp());
  const { success, reset } = await ratelimit.protected.limit(identifier);

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again at ${new Date(reset).toISOString()}`,
    });
  }

  return next({ ctx });
});

/**
 * Rate limit middleware for admin users.
 * Uses user ID as identifier. 200 requests per minute.
 */
const adminRateLimitMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ratelimit) {
    return next({ ctx });
  }

  const typedCtx = ctx as { user?: { id: number } };
  const identifier = typedCtx.user?.id?.toString() ?? (await getClientIp());
  const { success, reset } = await ratelimit.admin.limit(identifier);

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again at ${new Date(reset).toISOString()}`,
    });
  }

  return next({ ctx });
});

export const publicProcedure = t.procedure
  .use(sentryMiddleware)
  .use(publicRateLimitMiddleware);
export const protectedProcedure = t.procedure
  .use(sentryMiddleware)
  .use(authMiddleware)
  .use(protectedRateLimitMiddleware);
export const adminProcedure = t.procedure
  .use(sentryMiddleware)
  .use(adminMiddleware)
  .use(adminRateLimitMiddleware);
