"use client";

import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import type { RouterOutput } from "~/trpc/client";

const LOW_STOCK_THRESHOLD = 4;

export type StockState =
  | { kind: "in-stock"; count: number }
  | { kind: "low"; count: number }
  | { kind: "out" }
  /** out of stock, but the product takes backorders, so it can still be bought */
  | { kind: "backorder" }
  /** the product has variants but the chosen option combination matches none */
  | { kind: "unselected" };

export function getStockState(
  stock: number,
  allowBackorder: boolean,
): StockState {
  if (stock <= 0) return { kind: allowBackorder ? "backorder" : "out" };
  if (stock < LOW_STOCK_THRESHOLD) return { kind: "low", count: stock };
  return { kind: "in-stock", count: stock };
}

export function canPurchase(state: StockState) {
  return (
    state.kind === "in-stock" ||
    state.kind === "low" ||
    state.kind === "backorder"
  );
}

/**
 * Stock of what the shopper is about to buy: the selected variant when the product has variants,
 * otherwise the product itself. Products without variants never populate the variant store.
 */
export function useSelectedStock({
  productStock,
  hasVariants,
  allowBackorder,
}: {
  productStock: number | null;
  hasVariants: boolean;
  allowBackorder: boolean;
}): StockState {
  const selectedVariant = useVariantSelectionStore(
    (state) => state.selectedVariant,
  );

  if (!hasVariants) return getStockState(productStock ?? 0, allowBackorder);
  if (!selectedVariant) return { kind: "unselected" };
  return getStockState(selectedVariant.stock, allowBackorder);
}

type Cart = RouterOutput["public"]["carts"]["queries"]["find"];

/** Cart lines store a null variant for products without variants, so the lookup normalizes undefined to null. */
export function findCartLine(
  cart: Cart | undefined,
  productId: number,
  variantId: number | null | undefined,
) {
  return cart?.items.find(
    (item) =>
      item.productId === productId &&
      item.productVariantId === (variantId ?? null),
  );
}
