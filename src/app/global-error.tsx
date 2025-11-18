"use client";
import * as Sentry from "@sentry/nextjs";
import { HomeIcon, SkullIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Heading } from "~/components/heading";
import { Button } from "~/components/ui/button";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 pb-12">
          <SkullIcon className="size-24" />
          <Heading level={3}>Something Went Wrong!</Heading>
          <p className="text-muted-foreground">
            An unexpected error has occurred. Our team has been notified.
          </p>

          <Button size="lg" asChild>
            <Link href="/">
              <HomeIcon />
              Go back home kiddo
            </Link>
          </Button>
        </div>
      </body>
    </html>
  );
}
