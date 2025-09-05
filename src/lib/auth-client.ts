import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { env } from "~/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [adminClient()],
});
