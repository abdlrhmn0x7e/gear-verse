import { cn } from "~/lib/utils";
import type { RouterOutput } from "~/trpc/client";

export type OrderStatusValue =
  RouterOutput["public"]["orders"]["queries"]["findById"]["status"];
export type OrderPaymentMethod =
  RouterOutput["public"]["orders"]["queries"]["findById"]["paymentMethod"];

export const ORDER_STATUS: Record<
  OrderStatusValue,
  { label: string; dot: string }
> = {
  PENDING: { label: "Awaiting confirmation", dot: "bg-amber-500" },
  SHIPPED: { label: "On its way", dot: "bg-blue-500" },
  DELIVERED: { label: "Delivered", dot: "bg-green-600" },
  CANCELLED: { label: "Cancelled", dot: "bg-muted-foreground" },
  REFUNDED: { label: "Refunded", dot: "bg-muted-foreground" },
};

export function OrderStatusLabel({
  status,
  className,
}: {
  status: OrderStatusValue;
  className?: string;
}) {
  const { label, dot } = ORDER_STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium",
        className,
      )}
    >
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", dot)} />
      {label}
    </span>
  );
}

/** One plain sentence on what happens next, for the order list. */
export function orderNextStep(
  status: OrderStatusValue,
  paymentMethod: OrderPaymentMethod,
) {
  switch (status) {
    case "PENDING":
      return "We'll WhatsApp you to confirm the order and the shipping fee.";
    case "SHIPPED":
      return paymentMethod === "COD"
        ? "With the courier. Pay the rest in cash when it arrives."
        : "With the courier and on its way to you.";
    case "DELIVERED":
      return "Delivered. Enjoy your gear.";
    case "CANCELLED":
      return "This order was cancelled and won't ship.";
    case "REFUNDED":
      return "This order was refunded.";
  }
}

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
}: {
  status: OrderStatusValue;
  createdAt: Date;
  updatedAt: Date;
  formatDate: (date: Date) => string;
}): TimelineStep[] {
  const placed: TimelineStep = {
    title: "Order placed",
    state: "done",
    detail: formatDate(createdAt),
  };
  const updated = formatDate(updatedAt);

  if (status === "CANCELLED") {
    return [placed, { title: "Cancelled", state: "stopped", detail: updated }];
  }

  const reached =
    status === "REFUNDED" ? FLOW.length - 1 : FLOW.indexOf(status);

  const steps: TimelineStep[] = [
    placed,
    {
      title: "Confirmed by our team",
      state: reached === 0 ? "current" : "done",
      detail:
        reached === 0
          ? "We'll WhatsApp you to confirm the order and the shipping fee."
          : undefined,
    },
    {
      title: "Shipped",
      state: reached === 1 ? "current" : reached > 1 ? "done" : "upcoming",
      detail:
        reached === 1
          ? "With the courier. Delivery takes 1–2 business days."
          : undefined,
    },
    {
      title: "Delivered",
      state: reached === 2 ? "done" : "upcoming",
      detail: status === "DELIVERED" ? updated : undefined,
    },
  ];

  if (status === "REFUNDED") {
    steps.push({ title: "Refunded", state: "done", detail: updated });
  }

  return steps;
}
