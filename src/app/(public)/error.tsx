"use client";

import * as Sentry from "@sentry/nextjs";
import { ArrowRightIcon, RotateCwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";

/** Shown inside the storefront layout, so the navbar and footer stay and the shopper can retry or move on. */
export default function PublicError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 pb-12 text-center">
      <h1 className="text-headline-sm md:text-headline text-balance">
        Something went wrong
      </h1>
      <p className="text-muted-foreground text-body-lg max-w-md text-pretty">
        This page didn&apos;t load. Try again, or carry on shopping.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={() => retry()}>
          <RotateCwIcon data-icon="inline-start" />
          Try again
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/products">
            Browse the store
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
