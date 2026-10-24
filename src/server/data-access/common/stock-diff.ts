type StockLine = {
  productId: number;
  productVariantId: number | null;
  quantity: number;
};
type OrderLine = StockLine & { backorderedQuantity: number };

/**
 * Computes how much stock each product/variant gains when an order's items
 * are replaced. A positive diff returns units to stock, a negative diff takes
 * them out: removed lines give back the units they held from stock, new lines
 * take theirs and changed lines move by (old - new). Backordered units were
 * never taken, so they don't move.
 */
export const getStockDiff = (removed: OrderLine[], added: OrderLine[]) => {
  const diffs = new Map<string, StockLine>();
  const keyOf = (line: StockLine) =>
    `${line.productId}-${line.productVariantId ?? "none"}`;

  const apply = (line: OrderLine, sign: 1 | -1) => {
    const key = keyOf(line);
    const current = diffs.get(key);
    diffs.set(key, {
      productId: line.productId,
      productVariantId: line.productVariantId,
      quantity:
        (current?.quantity ?? 0) +
        sign * (line.quantity - line.backorderedQuantity),
    });
  };

  removed.forEach((line) => apply(line, 1));
  added.forEach((line) => apply(line, -1));

  return Array.from(diffs.values()).filter((line) => line.quantity !== 0);
};

/**
 * How many units an edited line leaves on backorder: the units it held from
 * stock stay held, so a lower quantity drops backordered units first and a
 * higher one takes the extra from stock. A new line holds everything.
 */
export const backorderedAfterEdit = (
  previous: { quantity: number; backorderedQuantity: number } | undefined,
  quantity: number,
) => {
  if (!previous) return 0;
  const held = previous.quantity - previous.backorderedQuantity;
  return Math.max(0, Math.min(previous.backorderedQuantity, quantity - held));
};
