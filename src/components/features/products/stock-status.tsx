import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import { BACKORDER_LEAD_DAYS } from "~/lib/utils/cart-stock";
import type { StockState } from "./hooks/use-selected-stock";

const STOCK_COPY = {
  "in-stock": {
    icon: CircleCheckIcon,
    className: "text-green-700 dark:text-green-400",
    key: "inStock",
  },
  low: {
    icon: CircleAlertIcon,
    className: "text-amber-700 dark:text-amber-400",
    key: "low",
  },
  out: {
    icon: CircleXIcon,
    className: "text-destructive",
    key: "out",
  },
  backorder: {
    icon: ClockIcon,
    className: "text-amber-700 dark:text-amber-400",
    key: "backorder",
  },
  unselected: {
    icon: CircleXIcon,
    className: "text-muted-foreground",
    key: "unselected",
  },
} as const satisfies Record<
  StockState["kind"],
  {
    icon: typeof CircleCheckIcon;
    className: string;
    key: string;
  }
>;

export function StockStatus({ state }: { state: StockState }) {
  const t = useTranslations("products.stock");
  const copy = STOCK_COPY[state.kind];
  return (
    <div role="status" className="flex flex-col gap-1">
      <p
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          copy.className,
        )}
      >
        <copy.icon className="size-4" strokeWidth={2} aria-hidden />
        {t(copy.key, { count: "count" in state ? state.count : 0 })}
      </p>
      {state.kind === "backorder" && (
        <p className="text-muted-foreground text-sm text-pretty">
          {t("backorderNote", { days: BACKORDER_LEAD_DAYS })}
        </p>
      )}
    </div>
  );
}
