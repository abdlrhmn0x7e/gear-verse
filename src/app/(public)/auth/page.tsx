import { Heading } from "~/components/heading";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { SignInButton } from "./_components/sign-in-button";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    return notFound();
  }

  return (
    <MaxWidthWrapper className="flex h-screen items-center justify-center">
      <Card className="from-primary/5 w-full max-w-xl bg-gradient-to-b to-transparent py-12">
        <CardHeader>
          <Heading level={3}>Login</Heading>
          <CardDescription>Login to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton />
        </CardContent>
      </Card>
    </MaxWidthWrapper>
  );
}
