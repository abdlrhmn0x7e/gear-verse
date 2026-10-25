import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import createMiddleware from "next-intl/middleware";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "./server/auth";
import { env } from "./env";
import { routing } from "./i18n/routing";
import { isFacetedSearch, isListingPath } from "./lib/seo/faceted";

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

const handleI18nRouting = createMiddleware(routing);

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
      // the storefront's 404, with its navbar; the admin itself stays outside locale routing
      return NextResponse.rewrite(new URL("/en/not-found", req.url));
    }

    return NextResponse.next();
  }

  // Sentry's tunnel route has a random path, so it can't be left out of the matcher by name
  if (
    req.method === "POST" &&
    req.nextUrl.searchParams.has("o") &&
    req.nextUrl.searchParams.has("p")
  ) {
    return NextResponse.next();
  }

  const response = localize(req);

  /**
   * Filtered and sorted listings copy the clean page, so they stay out of the
   * index while their links are still followed. A header rather than page
   * metadata: reading searchParams in generateMetadata would make every
   * listing's metadata dynamic and stream it into the body.
   */
  if (isListingPath(path) && isFacetedSearch(req.nextUrl.searchParams)) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }

  return response;
}

/**
 * English stays at unprefixed URLs and Arabic under /ar. Only the locale cookie, set when someone picks Arabic, sends an
 * unprefixed URL to its /ar twin (a temporary redirect); a first visit is never redirected by Accept-Language, so
 * crawlers and new visitors always get the English page there. /en/... is a permanent redirect to the unprefixed URL.
 */
function localize(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete("accept-language");
  const response = handleI18nRouting(
    new NextRequest(req, { headers: requestHeaders }),
  );
  // the switch writes the cookie in the browser, so visiting a page in a language never pins it, and pages stay
  // cacheable without a Set-Cookie
  response.headers.delete("set-cookie");
  response.headers.delete("x-middleware-set-cookie");

  const location = response.headers.get("location");
  if (!location || !/^\/en(\/|$)/.test(req.nextUrl.pathname)) {
    return response;
  }

  return NextResponse.redirect(location, 308);
}

export const config = {
  matcher: [
    // everything but API routes, Next internals, the admin, the AI client connect pages and files (paths with a dot)
    "/((?!api/|_next/|_vercel/|admin(?:/|$)|connect(?:/|$)|.*\\..*).*)",
    "/admin/:path*",
    "/api/auth/:path*",
  ],
};
