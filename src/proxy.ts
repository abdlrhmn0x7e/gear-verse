import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "./server/auth";
import { env } from "./env";

/**
 * Create rate limiter for auth routes.
 * Returns null if Upstash credentials are not configured.
 */
function createAuthRatelimit() {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "@upstash/ratelimit:auth",
  });
}

const authRatelimit = createAuthRatelimit();

/**
 * Get client IP address from request headers.
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Rate limit auth routes: 30 requests per minute
  if (path.startsWith("/api/auth")) {
    if (authRatelimit) {
      const ip = getClientIp(req);
      const { success, reset } = await authRatelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error: "Too many requests",
            message: `Rate limit exceeded. Try again at ${new Date(reset).toISOString()}`,
          },
          { status: 429 },
        );
      }
    }

    return NextResponse.next();
  }

  // Protect admin routes - require admin role
  if (path.startsWith("/admin")) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user.role !== "admin") {
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
