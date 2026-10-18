"use client";

import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import type { RouterOutput } from "~/trpc/client";

const LOW_STOCK_THRESHOLD = 4;

export type StockState =
  | { kind: "in-stock"; count: number }
  | { kind: "low"; count: number }
  | { kind: "out" }
  /** the product has variants but the chosen option combination matches none */
  | { kind: "unselected" };

export function getStockState(stock: number): StockState {
  if (stock <= 0) return { kind: "out" };
  if (stock < LOW_STOCK_THRESHOLD) return { kind: "low", count: stock };
  return { kind: "in-stock", count: stock };
}

export function canPurchase(state: StockState) {
  return state.kind === "in-stock" || state.kind === "low";
}

/**
 * Stock of what the shopper is about to buy: the selected variant when the product has variants,
 * otherwise the product itself. Products without variants never populate the variant store.
 */
export function useSelectedStock({
  productStock,
  hasVariants,
}: {
  productStock: number | null;
  hasVariants: boolean;
}): StockState {
  const selectedVariant = useVariantSelectionStore(
    (state) => state.selectedVariant,
  );

  if (!hasVariants) return getStockState(productStock ?? 0);
  if (!selectedVariant) return { kind: "unselected" };
  return getStockState(selectedVariant.stock);
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
