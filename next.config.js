/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { withSentryConfig } from "@sentry/nextjs/config";
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true,
    turbopackPluginRuntimeStrategy: "workerThreads",
  },
  typescript: {
    ignoreBuildErrors: true,
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

export default withSentryConfig(config, {
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
