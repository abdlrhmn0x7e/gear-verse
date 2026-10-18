import { inArray, sql } from "drizzle-orm";
import type { Tx } from "~/server/db";
import { orderItems, products, productVariants } from "~/server/db/schema";

type Line = { productId: number; productVariantId?: number | null };

const keyOf = (line: Line) =>
  `${line.productId}-${line.productVariantId ?? "none"}`;

/**
 * The price an order line is charged at: the price stored on the line when it
 * was ordered, falling back to the current price for lines saved before
 * unit prices were stored.
 */
export const orderLineUnitPrice = sql<number>`coalesce(${orderItems.unitPrice}, ${productVariants.overridePrice}, ${products.price})`;

/**
 * Sets each line's unit price. Lines that were already on the order keep the
 * price they were ordered at, new lines get the current price.
 */
export const withUnitPrices = <T extends Line>(
  lines: T[],
  current: Map<string, number>,
  previous = new Map<string, number | null>(),
) => {
  return lines.map((line) => {
    const key = keyOf(line);
    const unitPrice = previous.has(key)
      ? previous.get(key)!
      : (current.get(key) ?? null);
    return { ...line, unitPrice };
  });
};

export const toPreviousUnitPrices = (
  lines: (Line & { unitPrice: number | null })[],
) => new Map(lines.map((line) => [keyOf(line), line.unitPrice]));

/**
 * Looks up the current price of each line:
 * coalesce(variant.override_price, product.price).
 */
export const getCurrentUnitPrices = async (tx: Tx, lines: Line[]) => {
  const productIds = [...new Set(lines.map((line) => line.productId))];
  if (productIds.length === 0) {
    return new Map<string, number>();
  }

  const variantIds = [
    ...new Set(
      lines
        .map((line) => line.productVariantId)
        .filter((id): id is number => id != null),
    ),
  ];

  const productRows = await tx
    .select({ id: products.id, price: products.price })
    .from(products)
    .where(inArray(products.id, productIds));
  const variantRows =
    variantIds.length > 0
      ? await tx
          .select({
            id: productVariants.id,
            overridePrice: productVariants.overridePrice,
          })
          .from(productVariants)
          .where(inArray(productVariants.id, variantIds))
      : [];

  return resolveUnitPrices(
    lines,
    new Map(productRows.map((row) => [row.id, row.price])),
    new Map(variantRows.map((row) => [row.id, row.overridePrice])),
  );
};

export const resolveUnitPrices = (
  lines: Line[],
  productPrices: Map<number, number>,
  variantPrices: Map<number, number | null>,
) => {
  const prices = new Map<string, number>();
  for (const line of lines) {
    const price =
      (line.productVariantId != null
        ? variantPrices.get(line.productVariantId)
        : null) ?? productPrices.get(line.productId);
    if (price != null) {
      prices.set(keyOf(line), price);
    }
  }

  return prices;
};
