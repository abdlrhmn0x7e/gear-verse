"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { bucketLabel } from "./bucket-labels";
import { formatMoney } from "./format";

export type Bucket = { key: string; value: number };

/**
 * One bar per bucket, as tall as its share of the busiest bucket. Empty
 * buckets keep a hairline so the run of days still reads as a timeline.
 */
export function Bars({
  buckets,
  className,
  barClassName,
  interactive = false,
}: {
  buckets: Bucket[];
  className?: string;
  barClassName?: string;
  /** Hover and focus each bar for its bucket and amount. */
  interactive?: boolean;
}) {
  const max = Math.max(...buckets.map((bucket) => bucket.value), 0);

  return (
    <div className={cn("flex items-end", className)}>
      {buckets.map((bucket) => {
        const height = max > 0 ? (bucket.value / max) * 100 : 0;
        const bar = (
          <div
            className={cn(
              "flex h-full min-w-0 flex-1 items-end",
              interactive && "group/bar outline-none",
            )}
            tabIndex={interactive ? 0 : undefined}
            aria-label={
              interactive
                ? `${bucketLabel(bucket.key)}: ${formatMoney(bucket.value)}`
                : undefined
            }
          >
            <div
              className={cn(
                "w-full rounded-t-[3px]",
                bucket.value > 0
                  ? "bg-chart-bar"
                  : "bg-border h-px rounded-none",
                interactive &&
                  bucket.value > 0 &&
                  "group-hover/bar:bg-chart-bar-hover group-focus-visible/bar:bg-chart-bar-hover",
                interactive &&
                  "group-focus-visible/bar:outline-focus group-focus-visible/bar:outline-2 group-focus-visible/bar:outline-offset-2",
                barClassName,
              )}
              style={
                bucket.value > 0
                  ? { height: `max(${height}%, 2px)` }
                  : undefined
              }
            />
          </div>
        );

        if (!interactive) {
          return (
            <div key={bucket.key} className="contents">
              {bar}
            </div>
          );
        }

        return (
          <Tooltip key={bucket.key}>
            <TooltipTrigger asChild>{bar}</TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              <span className="text-background/70">
                {bucketLabel(bucket.key)}
              </span>
              <span className="font-medium tabular-nums">
                {formatMoney(bucket.value)}
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
