"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import { BuyNowButton } from "./buy-now-button";
import { canPurchase, useSelectedStock } from "./hooks/use-selected-stock";
import { ProductPrice } from "./product-price";
import { StockStatus } from "./stock-status";

export function PurchasePanel({
  productId,
  productTitle,
  productStock,
  hasVariants,
  price,
  strikeThroughPrice,
  showActions,
}: {
  productId: number;
  productTitle: string;
  productStock: number | null;
  hasVariants: boolean;
  price: number;
  strikeThroughPrice: number | null;
  showActions: boolean;
}) {
  const stock = useSelectedStock({ productStock, hasVariants });
  const purchasable = canPurchase(stock);
  const disabledLabel =
    stock.kind === "unselected" ? "Unavailable" : "Out of stock";

  const actionsRef = useRef<HTMLDivElement>(null);
  const [actionsOffScreen, setActionsOffScreen] = useState(false);

  useEffect(() => {
    const actions = actionsRef.current;
    if (!actions) return;

    // on a phone the buttons sit under the gallery, below the first screen, so the bar stands in for them whenever
    // they are out of view, above or below
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setActionsOffScreen(!entry.isIntersecting);
    });
    observer.observe(actions);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4">
        <ProductPrice
          originalPrice={price}
          strikeThroughPrice={strikeThroughPrice}
        />
        <StockStatus state={stock} />
      </div>

      {showActions && (
        <div ref={actionsRef} className="flex flex-col gap-3">
          <BuyNowButton
            productId={productId}
            disabled={!purchasable}
            disabledLabel={disabledLabel}
          />
          {purchasable && (
            <AddToCartButton
              productId={productId}
              productTitle={productTitle}
              disabled={!purchasable}
            />
          )}
        </div>
      )}

      {showActions && (
        <div
          // the page reserves room for the bar under the footer (the body's has-[[data-slot=buy-bar]] padding),
          // and toasts lift over it while data-visible is set
          data-slot="buy-bar"
          data-visible={actionsOffScreen || undefined}
          aria-hidden={!actionsOffScreen}
          inert={!actionsOffScreen}
          className={cn(
            "bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t pt-3 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] backdrop-blur-xl transition-[translate,opacity] duration-200 ease-out lg:hidden",
            actionsOffScreen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-full opacity-0 motion-reduce:translate-y-0",
          )}
        >
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{productTitle}</p>
              <ProductPrice
                originalPrice={price}
                strikeThroughPrice={strikeThroughPrice}
                size="sm"
              />
            </div>
            <BuyNowButton
              productId={productId}
              disabled={!purchasable}
              disabledLabel={disabledLabel}
              size="lg"
              className="w-auto shrink-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
