"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRightIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { PeriodChange } from "~/server/application/helpers/dashboard-range";
import { useTRPC } from "~/trpc/client";
import { Bars } from "./bars";
import { formatAge, formatMoney, isOverdue } from "./format";
import {
  periodLabels,
  previousPeriodLabels,
  useDashboardRange,
} from "./use-dashboard-range";

/**
 * One headline number: what it is (with its exact definition a hover away),
 * the number, a line or two of context, and where to act on it.
 */
function KpiCard({
  label,
  definition,
  value,
  aside,
  link,
  tone = "default",
  children,
}: {
  label: string;
  definition: ReactNode;
  value: ReactNode;
  /** Drawn beside the number: a sparkline. */
  aside?: ReactNode;
  link: { href: string; label: string };
  /** "warning" tints the card amber when the number needs attention now. */
  tone?: "default" | "warning";
  children?: ReactNode;
}) {
  return (
    <section
      data-tone={tone}
      className={cn(
        "bg-card flex min-w-0 flex-col gap-2 rounded-xl p-4 pb-3",
        tone === "warning" && "bg-warning/10 dark:bg-warning/15",
      )}
    >
      <div className="-my-1 flex items-center gap-0.5">
        <h2
          className={cn(
            "text-muted-foreground text-sm",
            tone === "warning" && "text-warning-foreground",
          )}
        >
          {label}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              aria-label={`How "${label}" is counted`}
            >
              <InfoIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="block max-w-72 py-2 text-pretty"
          >
            {definition}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p
          className={cn(
            "text-3xl font-medium tracking-tight tabular-nums",
            tone === "warning" && "text-warning-foreground",
          )}
        >
          {value}
        </p>
        {aside}
      </div>

      <div className="text-muted-foreground space-y-0.5 text-xs">
        {children}
      </div>

      <Button
        variant="ghost"
        size="xs"
        className="mt-auto -ml-2 self-start"
        asChild
      >
        <Link href={link.href}>
          {link.label}
          <ArrowRightIcon data-icon="inline-end" />
        </Link>
      </Button>
    </section>
  );
}

/** "▲ 12% vs the previous 7 days", in green going up and red going down. */
function ChangeLine({
  change,
  previousLabel,
}: {
  change: PeriodChange;
  previousLabel: string;
}) {
  if (change.direction === "flat") {
    return <p>No change from {previousLabel}</p>;
  }

  const up = change.direction === "up";

  return (
    <p>
      <span
        className={cn(
          "font-medium tabular-nums",
          up ? "text-success-foreground" : "text-destructive",
        )}
      >
        <span aria-hidden>{up ? "▲" : "▼"} </span>
        <span className="sr-only">{up ? "Up" : "Down"} </span>
        {change.percent === null ? "from 0" : `${change.percent}%`}
      </span>{" "}
      vs {previousLabel}
    </p>
  );
}

export function RevenueCard() {
  const trpc = useTRPC();
  const { range } = useDashboardRange();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.revenue.queryOptions({ range }),
  );

  return (
    <KpiCard
      label={data.estimated ? "Revenue (estimated)" : "Revenue"}
      definition={
        <>
          <span className="block">
            The value of every Shipped and Delivered order placed{" "}
            {periodLabels[range]} (Cairo time): quantity × the price each line
            sold at. Pending, cancelled and refunded orders don&apos;t count.
          </span>
          {data.estimated && (
            <span className="mt-1.5 block">
              Some of these lines are older than saved prices, so they count at
              today&apos;s price and the total is an estimate.
            </span>
          )}
        </>
      }
      value={formatMoney(data.total)}
      aside={
        <Bars
          buckets={data.buckets}
          className={cn(
            "mb-1.5 h-8 shrink-0",
            data.buckets.length > 7 ? "w-28 gap-px" : "w-20 gap-0.5",
          )}
        />
      }
      link={{
        href: "/admin/orders?status=DELIVERED",
        label: "Delivered orders",
      }}
    >
      <ChangeLine
        change={data.change}
        previousLabel={previousPeriodLabels[range]}
      />
    </KpiCard>
  );
}

export function OrdersCard() {
  const trpc = useTRPC();
  const { range } = useDashboardRange();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.orders.queryOptions({ range }),
  );

  return (
    <KpiCard
      label="Orders"
      definition={
        <>
          Orders placed {periodLabels[range]} (Cairo time) in any status but
          Cancelled. The average is their total value over their number.
        </>
      }
      value={data.count.toLocaleString("en-EG")}
      link={{ href: "/admin/orders", label: "View orders" }}
    >
      <p>
        Avg. order{" "}
        <span className="text-foreground tabular-nums">
          {formatMoney(data.averageOrderValue)}
        </span>
      </p>
      <ChangeLine
        change={data.change}
        previousLabel={previousPeriodLabels[range]}
      />
    </KpiCard>
  );
}

export function AwaitingConfirmationCard() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.pending.queryOptions(),
  );
  const now = new Date();
  const overdue = data.oldestCreatedAt
    ? isOverdue(data.oldestCreatedAt, now)
    : false;

  return (
    <KpiCard
      label="Awaiting confirmation"
      definition={
        <>
          Every Pending order, however old. Each needs a call or WhatsApp to
          confirm it and collect the prepaid shipping fee before it ships. Turns
          amber once the oldest has waited more than 24 hours.
        </>
      }
      value={data.count.toLocaleString("en-EG")}
      tone={overdue ? "warning" : "default"}
      link={{ href: "/admin/orders?status=PENDING", label: "Pending orders" }}
    >
      {data.oldestCreatedAt ? (
        <p
          className={cn(overdue && "text-warning-foreground font-medium")}
          suppressHydrationWarning
        >
          Oldest {formatAge(data.oldestCreatedAt, now)}
        </p>
      ) : (
        <p>Nothing waiting</p>
      )}
    </KpiCard>
  );
}

export function LowStockCard() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.lowStock.queryOptions(),
  );

  return (
    <KpiCard
      label="Low stock"
      definition={
        <>
          Stock rows (a product without variants, or a single variant) with{" "}
          {data.threshold} or fewer units left, for published products that
          aren&apos;t archived. The threshold is a store setting.
        </>
      }
      value={data.count.toLocaleString("en-EG")}
      link={{ href: "/admin/inventory", label: "Inventory" }}
    >
      <p>
        <span className={cn(data.outOfStock > 0 && "text-foreground")}>
          {data.outOfStock} out of stock
        </span>{" "}
        · threshold ≤ {data.threshold}
      </p>
    </KpiCard>
  );
}

export function KpiCardSkeleton({ label }: { label: string }) {
  return (
    <section className="bg-card flex flex-col gap-2 rounded-xl p-4 pb-3">
      <div className="-my-1 flex h-6 items-center">
        <h2 className="text-muted-foreground text-sm">{label}</h2>
      </div>
      <Skeleton className="my-1 h-7 w-28" />
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-2 h-4 w-24" />
    </section>
  );
}
