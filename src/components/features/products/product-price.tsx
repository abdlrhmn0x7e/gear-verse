"use client";

import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils/format-currency";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import { getDiscountPercentage } from "./product-card";

export function ProductPrice({
  originalPrice,
  strikeThroughPrice,
  size = "lg",
}: {
  originalPrice: number;
  strikeThroughPrice?: number | null;
  size?: "lg" | "sm";
}) {
  const price =
    useVariantSelectionStore((store) => store.selectedVariant?.overridePrice) ??
    originalPrice;
  // only show the old price when it is actually a discount on the shown price
  const discount = getDiscountPercentage(price, strikeThroughPrice);

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
      <span
        className={cn(
          "font-medium",
          size === "lg" ? "text-3xl tracking-tight" : "text-base",
        )}
      >
        {formatCurrency(price)}
      </span>
      {discount > 0 && (
        <>
          <s
            className={cn(
              "text-muted-foreground",
              size === "lg" ? "text-lg" : "text-sm",
            )}
          >
            <span className="sr-only">Was </span>
            {formatCurrency(strikeThroughPrice!)}
          </s>
          {size === "lg" && <Badge variant="brand">Save {discount}%</Badge>}
        </>
      )}
    </p>
  );
}
