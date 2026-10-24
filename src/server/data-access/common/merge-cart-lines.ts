type CartLine = {
  productId: number;
  productVariantId: number | null;
  quantity: number;
};

export const cartLineKey = (line: {
  productId: number;
  productVariantId?: number | null;
}) => `${line.productId}-${line.productVariantId ?? "none"}`;

/**
 * Plans how to move the lines of a guest cart into a signed in user's cart.
 * Lines for the same product/variant are summed, and the guest's units only
 * fill up to the available stock. The user's own quantity is never lowered,
 * and guest lines with nothing left to add are dropped.
 */
export const mergeCartLines = (
  userLines: (CartLine & { id: number })[],
  guestLines: CartLine[],
  stockByKey: Map<string, number>,
) => {
  const userLinesByKey = new Map(
    userLines.map((line) => [cartLineKey(line), line]),
  );

  const toUpdate: { id: number; quantity: number }[] = [];
  const toInsert: CartLine[] = [];

  for (const guestLine of guestLines) {
    const key = cartLineKey(guestLine);
    const userLine = userLinesByKey.get(key);
    const owned = userLine?.quantity ?? 0;
    const stock = stockByKey.get(key) ?? 0;
    const quantity = Math.min(
      owned + guestLine.quantity,
      Math.max(stock, owned),
    );

    if (quantity <= owned) continue;

    if (userLine) {
      toUpdate.push({ id: userLine.id, quantity });
      // a guest cart can't have the same line twice, but keep it consistent
      userLine.quantity = quantity;
    } else {
      toInsert.push({ ...guestLine, quantity });
    }
  }

  return { toUpdate, toInsert };
};
