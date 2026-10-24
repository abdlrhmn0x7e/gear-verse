/** How long a backordered item takes to source on average, counted from when we confirm the order on WhatsApp. */
export const BACKORDER_LEAD_DAYS = 14;

export type CartLineStock = {
  quantity: number;
  stock: number | null;
  allowBackorder: boolean;
};

/** "out" when none is left, "short" when fewer are left than the line asks for, null when the line can be bought as is.
 *  "backorder" when it's out or short but the product takes backorders: it can still be bought, the missing units are
 *  sourced. Shared by the cart drawer and checkout, so both treat the same lines the same way. */
export function getStockIssue(
  line: CartLineStock,
): "out" | "short" | "backorder" | null {
  const stock = line.stock ?? 0;
  if (stock >= line.quantity) return null;
  if (line.allowBackorder) return "backorder";
  return stock <= 0 ? "out" : "short";
}

/** The lines checkout would reject; they have to be fixed before the customer can check out. */
export function blocksCheckout(line: CartLineStock) {
  const issue = getStockIssue(line);
  return issue === "out" || issue === "short";
}
