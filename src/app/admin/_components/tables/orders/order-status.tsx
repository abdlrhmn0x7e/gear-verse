import {
  BanknoteArrowDownIcon,
  CheckCircleIcon,
  ClockFadingIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";

export function OrderStatus({
  status,
  variant = "badge",
}: {
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "REFUNDED" | "CANCELLED";
  variant?: "badge" | "plain";
}) {
  const statusMap = {
    PENDING: {
      icon: <ClockFadingIcon />,
      label: "Pending",
      badgeVariant: "warning" as const,
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

  const { icon, label, badgeVariant } =
    statusMap[status] ?? statusMap.CANCELLED;

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
