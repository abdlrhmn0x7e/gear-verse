"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";

/** The half of the greeting that says how many orders wait for a confirmation call. */
export function WaitingSummary() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.pending.queryOptions(),
  );

  if (data.count === 0) return <>You&apos;re all caught up.</>;

  return (
    <>
      {data.count === 1
        ? "1 order is waiting for you."
        : `${data.count.toLocaleString("en-EG")} orders are waiting for you.`}
    </>
  );
}

export function WaitingSummarySkeleton() {
  return (
    <span className="bg-accent inline-block h-3.5 w-44 animate-pulse rounded-full align-middle" />
  );
}
