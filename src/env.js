import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BETTER_AUTH_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    AWS_S3_BUCKET_NAME: z.string(),
    AWS_S3_REGION: z.string(),
    AWS_S3_ACCESS_KEY_ID: z.string(),
    AWS_S3_SECRET_ACCESS_KEY: z.string(),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    DATABASE_URL: process.env.DATABASE_URL,

    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,

    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
