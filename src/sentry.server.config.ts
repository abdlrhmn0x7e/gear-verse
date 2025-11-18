import * as Sentry from "@sentry/nextjs";
import { env } from "~/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  // that it will also get attached to your source maps
});
