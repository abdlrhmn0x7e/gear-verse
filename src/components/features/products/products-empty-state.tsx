"use client";

import { ArrowRightIcon, FunnelXIcon, PackageSearchIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

/** Every listing ends in a way forward: clear what narrowed it, or go to the full store. */
export function ProductsEmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="bg-card flex flex-col items-center gap-6 rounded-3xl px-6 py-20 text-center">
      <PackageSearchIcon
        className="text-muted-foreground size-10"
        strokeWidth={1.5}
        aria-hidden
      />
      <div className="max-w-sm space-y-2">
        <h2 className="text-title text-balance">
          {hasFilters
            ? "Nothing matches these filters"
            : "Nothing in stock here yet"}
        </h2>
        <p className="text-muted-foreground text-pretty">
          {hasFilters
            ? "Try removing a filter, or browse everything in the store."
            : "Check back soon, or browse the rest of the store."}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {hasFilters && (
          <Button onClick={onClearFilters}>
            <FunnelXIcon data-icon="inline-start" />
            Clear filters
          </Button>
        )}
        <Button variant={hasFilters ? "outline" : "default"} asChild>
          <Link href="/products">
            Browse all products
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
