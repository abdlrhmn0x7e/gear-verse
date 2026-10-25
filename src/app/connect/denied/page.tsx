import { Suspense } from "react";

import { Logo } from "~/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getSession } from "~/server/auth";

export const metadata = { title: "Can't connect" };

/** Where the OAuth flow sends anyone it refuses: a signed in non-admin, or a client the store doesn't trust. */
export default function DeniedPage({
  searchParams,
}: PageProps<"/connect/denied">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <Logo />
      <Card className="w-full max-w-md">
        <Suspense>
          <Refusal searchParams={searchParams} />
        </Suspense>
      </Card>
    </main>
  );
}

async function Refusal({
  searchParams,
}: Pick<PageProps<"/connect/denied">, "searchParams">) {
  const { reason } = await searchParams;

  if (reason === "client") {
    return (
      <CardHeader>
        <CardTitle>Can&apos;t connect this app</CardTitle>
        <CardDescription>
          This app isn&apos;t one Gear Verse trusts. Connect from ChatGPT or
          Claude.
        </CardDescription>
      </CardHeader>
    );
  }

  const session = await getSession();

  return (
    <>
      <CardHeader>
        <CardTitle>Admins only</CardTitle>
        <CardDescription>
          Only Gear Verse admins can connect ChatGPT or Claude to the store.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {session && !session.user.isAnonymous && (
          <p>
            You&apos;re signed in as{" "}
            <span className="font-medium">{session.user.email}</span>.
          </p>
        )}
        <p className="text-muted-foreground">
          Sign out of the store and connect again with your admin account.
        </p>
      </CardContent>
    </>
  );
}
