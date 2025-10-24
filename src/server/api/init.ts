import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "../auth";
import { app } from "../application";
import { cache } from "react";
import { headers } from "next/headers";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const data = await auth.api.getSession({ headers: await headers() });

  return {
    app,
    user: data?.user
      ? {
          id: parseInt(data.user.id),
          role: data.user.role,
        }
      : null,
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
  const { user } = ctx;

  if (!user) {
    console.log("Auth middleware: No session found");
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return next({ ctx: { ...ctx, user } });
});

const adminMiddleware = t.middleware(async ({ next, ctx }) => {
  const { user } = ctx;
  if (!user) {
    console.log("Admin middleware: No session found");
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  if (user.role !== "admin") {
    console.log("Admin middleware: User is not admin, role:", user.role);
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx: { ...ctx, user } });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
export const adminProcedure = t.procedure.use(adminMiddleware);
