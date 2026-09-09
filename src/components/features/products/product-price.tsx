"use client";

import { formatCurrency } from "~/lib/utils/format-currency";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";

export function ProductPrice({
  originalPrice,
  strikeThroughPrice,
}: {
  originalPrice: number;
  strikeThroughPrice?: number | null;
}) {
  const price =
    useVariantSelectionStore((store) => store.selectedVariant?.overridePrice) ??
    originalPrice;

  // only show the old price when it is actually a discount on the shown price
  const showStrikeThrough = !!strikeThroughPrice && strikeThroughPrice > price;

  return (
    <>
      <span className="text-primary dark:text-primary-foreground text-3xl font-bold lg:text-4xl">
        {formatCurrency(price)}
      </span>

      {showStrikeThrough && (
        <span className="text-muted-foreground line-through">
          {formatCurrency(strikeThroughPrice)}
        </span>
      )}
    </>
  );
}
