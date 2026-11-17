import {
  BadgeCheckIcon,
  BanknoteArrowDownIcon,
  CheckCircleIcon,
  ClockFadingIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";

export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof orderStatuses)[number];

export const orderStatusMap = {
  PENDING: {
    icon: <ClockFadingIcon />,
    label: "Pending",
    badgeVariant: "warning" as const,
  },
  CONFIRMED: {
    icon: <BadgeCheckIcon />,
    label: "Confirmed",
    badgeVariant: "brand" as const,
  },
  SHIPPED: {
    icon: <TruckIcon />,
    label: "Shipped",
    badgeVariant: "info" as const,
  },
  DELIVERED: {
    icon: <CheckCircleIcon />,
    label: "Delivered",
    badgeVariant: "success" as const,
  },
  REFUNDED: {
    icon: <BanknoteArrowDownIcon />,
    label: "Refunded",
    badgeVariant: "error" as const,
  },
  CANCELLED: {
    icon: <XCircleIcon />,
    label: "Cancelled",
    badgeVariant: "error" as const,
  },
};

/** The one step forward from each status, and what the button that takes it says. Final statuses have none. */
export const nextOrderStatus: Partial<
  Record<OrderStatusValue, { status: OrderStatusValue; action: string }>
> = {
  PENDING: { status: "CONFIRMED", action: "Confirm" },
  CONFIRMED: { status: "SHIPPED", action: "Ship" },
  SHIPPED: { status: "DELIVERED", action: "Deliver" },
};

export function OrderStatus({
  status,
  variant = "badge",
}: {
  status: OrderStatusValue;
  variant?: "badge" | "plain";
}) {
  const { icon, label, badgeVariant } =
    orderStatusMap[status] ?? orderStatusMap.CANCELLED;

  if (variant === "plain") {
    return (
      <div className="flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Badge variant={badgeVariant}>
      {icon}
      {label}
    </Badge>
  );
}
