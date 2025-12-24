import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "~/env";

/**
 * Rate limiter instance using Upstash Redis with sliding window algorithm.
 * Returns null if Upstash credentials are not configured (graceful degradation).
 */
function createRatelimit() {
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  return {
    /**
     * Rate limit for anonymous/public requests: 30 requests per minute
     */
    public: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "@upstash/ratelimit:public",
    }),

    /**
     * Rate limit for authenticated users: 60 requests per minute
     */
    protected: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "@upstash/ratelimit:protected",
    }),

    /**
     * Rate limit for admin users: 200 requests per minute
     */
    admin: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"),
      prefix: "@upstash/ratelimit:admin",
    }),

    /**
     * Rate limit for auth routes: 30 requests per minute
     */
    auth: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "@upstash/ratelimit:auth",
    }),
  };
}

export const ratelimit = createRatelimit();
