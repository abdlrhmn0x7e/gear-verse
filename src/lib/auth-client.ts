import { createAuthClient } from "better-auth/react";
import { adminClient, anonymousClient } from "better-auth/client/plugins";
import { env } from "~/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [adminClient(), anonymousClient()],
});

export type User = NonNullable<
  Awaited<ReturnType<typeof authClient.useSession>>["data"]
>["user"];
