import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import type { RouterOutput } from "~/trpc/client";

export type OrderStatusValue =
  RouterOutput["public"]["orders"]["queries"]["findById"]["status"];
export type OrderPaymentMethod =
  RouterOutput["public"]["orders"]["queries"]["findById"]["paymentMethod"];

/** each status's dot; its label is orders.status.<status> */
export const ORDER_STATUS: Record<OrderStatusValue, { dot: string }> = {
  PENDING: { dot: "bg-amber-500" },
  SHIPPED: { dot: "bg-blue-500" },
  DELIVERED: { dot: "bg-green-600" },
  CANCELLED: { dot: "bg-muted-foreground" },
  REFUNDED: { dot: "bg-muted-foreground" },
};

export function OrderStatusLabel({
  status,
  className,
}: {
  status: OrderStatusValue;
  className?: string;
}) {
  const t = useTranslations("orders.status");
  const { dot } = ORDER_STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium",
        className,
      )}
    >
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", dot)} />
      {t(status)}
    </span>
  );
}

/** One plain sentence on what happens next, for the order list: its key under orders.nextStep. */
export function orderNextStep(
  status: OrderStatusValue,
  paymentMethod: OrderPaymentMethod,
) {
  return status === "SHIPPED" && paymentMethod === "COD"
    ? "SHIPPED_COD"
    : status;
}

type TimelineText =
  | "placed"
  | "confirmed"
  | "confirmedDetail"
  | "shipped"
  | "shippedDetail"
  | "delivered"
  | "cancelled"
  | "refunded";

export type TimelineStep = {
  title: string;
  state: "done" | "current" | "upcoming" | "stopped";
  /** shown under the title: a date for reached steps, a short note for the current one */
  detail?: string;
};

const FLOW = ["PENDING", "SHIPPED", "DELIVERED"] as const;

/**
 * Placed, confirmed by the team, shipped, delivered. There's no separate
 * "confirmed" status: an order stays pending until it ships, so while pending
 * the confirmation call is the step in progress, and once it ships that step
 * is done. Cancelled and refunded orders end the line with their own step.
 */
export function orderTimeline({
  status,
  createdAt,
  updatedAt,
  formatDate,
  t,
}: {
  status: OrderStatusValue;
  createdAt: Date;
  updatedAt: Date;
  formatDate: (date: Date) => string;
  /** orders.timeline */
  t: (key: TimelineText) => string;
}): TimelineStep[] {
  const placed: TimelineStep = {
    title: t("placed"),
    state: "done",
    detail: formatDate(createdAt),
  };
  const updated = formatDate(updatedAt);

  if (status === "CANCELLED") {
    return [
      placed,
      { title: t("cancelled"), state: "stopped", detail: updated },
    ];
  }

  const reached =
    status === "REFUNDED" ? FLOW.length - 1 : FLOW.indexOf(status);

  const steps: TimelineStep[] = [
    placed,
    {
      title: t("confirmed"),
      state: reached === 0 ? "current" : "done",
      detail: reached === 0 ? t("confirmedDetail") : undefined,
    },
    {
      title: t("shipped"),
      state: reached === 1 ? "current" : reached > 1 ? "done" : "upcoming",
      detail: reached === 1 ? t("shippedDetail") : undefined,
    },
    {
      title: t("delivered"),
      state: reached === 2 ? "done" : "upcoming",
      detail: status === "DELIVERED" ? updated : undefined,
    },
  ];

  if (status === "REFUNDED") {
    steps.push({ title: t("refunded"), state: "done", detail: updated });
  }

  return steps;
}
