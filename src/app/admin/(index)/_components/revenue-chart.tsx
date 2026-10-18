"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Skeleton } from "~/components/ui/skeleton";
import { useTRPC } from "~/trpc/client";
import { Bars } from "./bars";
import { bucketLabel } from "./bucket-labels";
import { formatMoney } from "./format";
import { Panel } from "./panel";
import { periodLabels, useDashboardRange } from "./use-dashboard-range";

/** Which buckets get a label under the axis, so the labels never crowd. */
function labelEvery(count: number) {
  if (count <= 7) return 1;
  if (count <= 24) return 3;
  return 5;
}

/** Shipped and delivered revenue per Cairo day of the range, or per hour of today. */
export function RevenueChart() {
  const trpc = useTRPC();
  const { range } = useDashboardRange();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.revenue.queryOptions({ range }),
  );
  const max = Math.max(...data.buckets.map((bucket) => bucket.value), 0);
  const every = labelEvery(data.buckets.length);
  const lastIndex = data.buckets.length - 1;

  return (
    <Panel
      title={data.unit === "hour" ? "Revenue by hour" : "Revenue by day"}
      description={`Shipped and delivered orders ${periodLabels[range]}, Cairo time`}
    >
      <figure className="flex flex-1 flex-col pt-2">
        <figcaption className="sr-only">
          {data.unit === "hour" ? "Revenue by hour" : "Revenue by day"},{" "}
          {formatMoney(data.total)} in total
        </figcaption>
        <div className="relative h-44">
          {/* the busiest bucket's amount on a hairline across the top */}
          <div className="border-border absolute inset-x-0 top-0 border-t border-dashed" />
          <span className="text-muted-foreground bg-card absolute top-0 right-0 -translate-y-1/2 pl-1.5 text-[0.6875rem] tabular-nums">
            {max > 0 ? formatMoney(max) : ""}
          </span>
          <Bars
            interactive
            buckets={data.buckets}
            className={
              data.buckets.length > 7
                ? "h-full gap-1 pt-3"
                : "h-full gap-3 pt-3"
            }
          />
          {max === 0 && (
            <p className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
              No shipped or delivered orders {periodLabels[range]}.
            </p>
          )}
        </div>
        <div
          aria-hidden
          className={
            data.buckets.length > 7
              ? "border-border mt-0 flex gap-1 border-t pt-1.5"
              : "border-border mt-0 flex gap-3 border-t pt-1.5"
          }
        >
          {data.buckets.map((bucket, i) => (
            <span
              key={bucket.key}
              className="text-muted-foreground min-w-0 flex-1 overflow-visible text-center text-[0.6875rem] whitespace-nowrap tabular-nums"
            >
              {i % every === 0 || (every === 1 && i === lastIndex)
                ? bucketLabel(bucket.key, "short")
                : ""}
            </span>
          ))}
        </div>
      </figure>
    </Panel>
  );
}

export function RevenueChartSkeleton() {
  return (
    <Panel title="Revenue by day">
      <div className="flex h-50 items-end gap-1 pt-2">
        {[40, 65, 30, 80, 55, 70, 45].map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-[3px] rounded-b-none"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </Panel>
  );
}
