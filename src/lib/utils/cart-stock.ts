export type CartLineStock = { quantity: number; stock: number | null };

/** "out" when none is left, "short" when fewer are left than the line asks for, null when the line can be bought as is.
 *  Shared by the cart drawer and checkout, so both block the order on the same lines. */
export function getStockIssue(line: CartLineStock): "out" | "short" | null {
  const stock = line.stock ?? 0;
  if (stock <= 0) return "out";
  if (stock < line.quantity) return "short";
  return null;
}
