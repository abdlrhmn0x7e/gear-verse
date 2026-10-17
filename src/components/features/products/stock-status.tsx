import { CircleAlertIcon, CircleCheckIcon, CircleXIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { StockState } from "./hooks/use-selected-stock";

const STOCK_COPY = {
  "in-stock": {
    icon: CircleCheckIcon,
    className: "text-green-700 dark:text-green-400",
    label: () => "In stock, ready to ship",
  },
  low: {
    icon: CircleAlertIcon,
    className: "text-amber-700 dark:text-amber-400",
    label: (state: StockState) =>
      state.kind === "low" ? `Only ${state.count} left in stock` : "",
  },
  out: {
    icon: CircleXIcon,
    className: "text-destructive",
    label: () => "Out of stock",
  },
  unselected: {
    icon: CircleXIcon,
    className: "text-muted-foreground",
    label: () => "This combination isn't available",
  },
} satisfies Record<
  StockState["kind"],
  {
    icon: typeof CircleCheckIcon;
    className: string;
    label: (state: StockState) => string;
  }
>;

export function StockStatus({ state }: { state: StockState }) {
  const copy = STOCK_COPY[state.kind];
  return (
    <p
      role="status"
      className={cn("flex items-center gap-2 text-sm font-medium", copy.className)}
    >
      <copy.icon className="size-4" strokeWidth={2} aria-hidden />
      {copy.label(state)}
    </p>
  );
}
