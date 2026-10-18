type StockLine = {
  productId: number;
  productVariantId: number | null;
  quantity: number;
};

/**
 * Computes how much stock each product/variant gains when an order's items
 * are replaced. A positive diff returns units to stock, a negative diff takes
 * them out: removed lines give back their quantity, new lines take theirs and
 * changed lines move by (old - new).
 */
export const getStockDiff = (removed: StockLine[], added: StockLine[]) => {
  const diffs = new Map<string, StockLine>();
  const keyOf = (line: StockLine) =>
    `${line.productId}-${line.productVariantId ?? "none"}`;

  const apply = (line: StockLine, sign: 1 | -1) => {
    const key = keyOf(line);
    const current = diffs.get(key);
    diffs.set(key, {
      productId: line.productId,
      productVariantId: line.productVariantId,
      quantity: (current?.quantity ?? 0) + sign * line.quantity,
    });
  };

  removed.forEach((line) => apply(line, 1));
  added.forEach((line) => apply(line, -1));

  return Array.from(diffs.values()).filter((line) => line.quantity !== 0);
};
