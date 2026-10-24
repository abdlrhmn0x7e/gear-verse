/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { withSentryConfig } from "@sentry/nextjs/config";
import createNextIntlPlugin from "next-intl/plugin";
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true,
    // On Vercel the restored Turbopack build cache recompiled from cold anyway (72s for a 4-file change, 3.2s locally),
    // so it only added ~16s of compaction before deploy and a 936 MB cache upload after. Dev keeps its cache.
    turbopackFileSystemCacheForBuild: false,
    // the storefront's root layout sits under [locale] and the admin has its own, so unmatched URLs need a 404 of their own
    globalNotFound: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // shortcut: hand-listed renamed product slugs, until slug edits in the admin record their own redirects
  async redirects() {
    return ["", "/ar"].map((prefix) => ({
      source: `${prefix}/products/razer-huntman-v3-pro-tenekyeless-8khz-white-editiongood-condition`,
      destination: `${prefix}/products/razer-huntsman-v3-pro-tenkeyless-8khz-white-edition-used`,
      permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default withSentryConfig(createNextIntlPlugin()(config), {
  org: "gear-verse",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,

  // Pass the auth token
  authToken: env.SENTRY_AUTH_TOKEN,

  // Skip source map upload when no auth token is configured
  sourcemaps: {
    disable: !env.SENTRY_AUTH_TOKEN,
  },

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // Avoid Ad Blockers
  tunnelRoute: true,

  // Capture React components names
  reactComponentAnnotation: {
    enabled: true,
  },
});
