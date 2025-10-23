"use client";

import { formatCurrency } from "~/lib/utils/format-currency";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";

export function ProductPrice({ originalPrice }: { originalPrice: number }) {
  const price =
    useVariantSelectionStore((store) => store.selectedVariant?.overridePrice) ??
    originalPrice;

  return (
    <span className="text-primary dark:text-primary-foreground text-3xl font-bold lg:text-4xl">
      {formatCurrency(price)}
    </span>
  );
}
