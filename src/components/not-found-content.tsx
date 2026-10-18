import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 pb-12 text-center">
      <p className="text-muted-foreground text-sm font-medium tabular-nums">
        404
      </p>
      <h1 className="text-headline-sm md:text-headline text-balance">
        Page not found
      </h1>
      <p className="text-muted-foreground text-body-lg max-w-md text-pretty">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button
        size="lg"
        className="mt-2"
        nativeButton={false}
        render={<Link href="/products" />}
      >
        Browse the store
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </div>
  );
}
