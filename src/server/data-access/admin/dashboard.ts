import { and, asc, desc, eq, gte, inArray, lt, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/server/db";
import {
  addresses,
  inventoryItems,
  orderItems,
  orders,
  productOptions,
  productOptionValues,
  productOptionValuesVariants,
  products,
  productVariants,
  reviews,
  users,
} from "~/server/db/schema";
import { orderedOptionValues } from "../common/cte";

type Period = { start: Date; end: Date };
type ComparedPeriod = Period & { previousStart: Date; previousEnd: Date };

// created_at is a UTC wall-clock `timestamp`, so a JS instant is compared as
// its UTC wall clock, and read back on Cairo's clock for day and hour buckets
const asTimestamp = (date: Date) => sql`${date.toISOString()}::timestamp`;
const cairoCreatedAt = sql`((${orders.createdAt} at time zone 'UTC') at time zone 'Africa/Cairo')`;

// rows of either period; anything else in between belongs to neither
const inPeriods = ({
  start,
  end,
  previousStart,
  previousEnd,
}: ComparedPeriod) =>
  or(
    and(gte(orders.createdAt, start), lt(orders.createdAt, end)),
    and(
      gte(orders.createdAt, previousStart),
      lt(orders.createdAt, previousEnd),
    ),
  );

// what a line sold for: the price saved on the line, or today's price for
// lines from before prices were saved
const lineTotal = sql`${orderItems.quantity} * coalesce(${orderItems.unitPrice}, ${productVariants.overridePrice}, ${products.price})`;

const FALLBACK_LOW_STOCK_THRESHOLD = 2;

export const _dashboard = {
  queries: {
    /** SHIPPED and DELIVERED revenue per bucket of the current period, and the previous period's total. */
    revenue: async ({
      unit,
      ...periods
    }: ComparedPeriod & { unit: "hour" | "day" }) => {
      const keyFormat = unit === "hour" ? `YYYY-MM-DD"T"HH24` : "YYYY-MM-DD";
      const period = sql<
        "current" | "previous"
      >`case when ${orders.createdAt} >= ${asTimestamp(periods.start)} then 'current' else 'previous' end`;

      return db
        .select({
          period: period.as("period"),
          key: sql<string>`to_char(${cairoCreatedAt}, ${sql.raw(`'${keyFormat}'`)})`.as(
            "key",
          ),
          revenue: sql<number>`coalesce(sum(${lineTotal}), 0)::int`,
          estimated: sql<boolean>`coalesce(bool_or(${orderItems.unitPrice} is null), false)`,
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .where(
          and(
            inArray(orders.status, ["SHIPPED", "DELIVERED"]),
            inPeriods(periods),
          ),
        )
        .groupBy(sql`1`, sql`2`);
    },

    /** Orders that weren't cancelled, with their value, in each period. */
    orders: async (periods: ComparedPeriod) => {
      const orderTotals = db
        .select({
          id: orders.id,
          createdAt: orders.createdAt,
          total: sql<number>`coalesce(sum(${lineTotal}), 0)`.as("total"),
        })
        .from(orders)
        .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
        .leftJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .where(and(ne(orders.status, "CANCELLED"), inPeriods(periods)))
        .groupBy(orders.id, orders.createdAt)
        .as("order_totals");

      const isCurrent = sql`${orderTotals.createdAt} >= ${asTimestamp(periods.start)}`;

      return db
        .select({
          count: sql<number>`count(*) filter (where ${isCurrent})::int`,
          value: sql<number>`coalesce(sum(${orderTotals.total}) filter (where ${isCurrent}), 0)::int`,
          previousCount: sql<number>`count(*) filter (where not ${isCurrent})::int`,
        })
        .from(orderTotals)
        .then(([row]) => row ?? { count: 0, value: 0, previousCount: 0 });
    },

    /** Every PENDING order, whenever it was placed: how many and since when. */
    pendingSummary: async () => {
      return db
        .select({
          count: sql<number>`count(*)::int`,
          oldestCreatedAt: sql<Date | null>`min(${orders.createdAt})`.mapWith(
            orders.createdAt,
          ),
        })
        .from(orders)
        .where(eq(orders.status, "PENDING"))
        .then(([row]) => row ?? { count: 0, oldestCreatedAt: null });
    },

    /** The oldest PENDING orders with who to call and what they ordered. */
    pendingOrders: async (limit: number) => {
      type Line = { title: string; quantity: number };

      const lines = db
        .select({
          orderId: orderItems.orderId,
          total: sql<number>`coalesce(sum(${lineTotal}), 0)::int`.as("total"),
          quantity: sql<number>`sum(${orderItems.quantity})::int`.as(
            "quantity",
          ),
          lines: sql<Line[]>`jsonb_agg(
            jsonb_build_object('title', ${products.title}, 'quantity', ${orderItems.quantity})
            order by ${orderItems.id}
          )`.as("lines"),
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .groupBy(orderItems.orderId)
        .as("lines");

      return db
        .select({
          id: orders.id,
          createdAt: orders.createdAt,
          customerName: sql<string>`coalesce(${addresses.fullName}, ${users.name})`,
          phoneNumber: addresses.phoneNumber,
          city: addresses.city,
          governorate: addresses.governorate,
          total: sql<number>`coalesce(${lines.total}, 0)`,
          quantity: sql<number>`coalesce(${lines.quantity}, 0)`,
          lines: sql<Line[]>`coalesce(${lines.lines}, '[]'::jsonb)`,
        })
        .from(orders)
        .leftJoin(addresses, eq(orders.addressId, addresses.id))
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(lines, eq(orders.id, lines.orderId))
        .where(eq(orders.status, "PENDING"))
        .orderBy(asc(orders.createdAt), asc(orders.id))
        .limit(limit);
    },

    /** store_settings.low_stock_threshold, or 2 while the table or its row is missing. */
    lowStockThreshold: async () => {
      try {
        const rows = await db.execute<{ low_stock_threshold: number }>(
          sql`select low_stock_threshold from store_settings limit 1`,
        );
        return rows[0]?.low_stock_threshold ?? FALLBACK_LOW_STOCK_THRESHOLD;
      } catch {
        return FALLBACK_LOW_STOCK_THRESHOLD;
      }
    },

    /** Stock rows at or under the threshold for products on sale, emptiest first. */
    lowStock: async ({
      threshold,
      limit,
    }: {
      threshold: number;
      limit: number;
    }) => {
      const variantValues = db
        .select({
          productVariantId: productOptionValuesVariants.productVariantId,
          values: orderedOptionValues.as("values"),
        })
        .from(productOptionValuesVariants)
        .innerJoin(
          productOptionValues,
          eq(
            productOptionValuesVariants.productOptionValueId,
            productOptionValues.id,
          ),
        )
        .innerJoin(
          productOptions,
          eq(productOptionValues.productOptionId, productOptions.id),
        )
        .groupBy(productOptionValuesVariants.productVariantId)
        .as("variant_values");

      const variant = alias(productVariants, "variant");

      // product-level rows have no variant; variant rows need a live variant
      const onSale = and(
        eq(products.published, true),
        eq(products.archived, false),
        sql`(${inventoryItems.productVariantId} is null or ${variant.archived} = false)`,
        sql`${inventoryItems.quantity} <= ${threshold}`,
      );

      const base = () =>
        db
          .select({
            id: inventoryItems.id,
            productId: inventoryItems.productId,
            productVariantId: inventoryItems.productVariantId,
            title: products.title,
            quantity: inventoryItems.quantity,
            values: sql<
              string[]
            >`coalesce(${variantValues.values}, '[]'::jsonb)`,
          })
          .from(inventoryItems)
          .innerJoin(products, eq(inventoryItems.productId, products.id))
          .leftJoin(variant, eq(inventoryItems.productVariantId, variant.id))
          .leftJoin(
            variantValues,
            eq(inventoryItems.productVariantId, variantValues.productVariantId),
          )
          .where(onSale);

      const [summary, items] = await Promise.all([
        db
          .select({
            count: sql<number>`count(*)::int`,
            outOfStock: sql<number>`count(*) filter (where ${inventoryItems.quantity} = 0)::int`,
          })
          .from(inventoryItems)
          .innerJoin(products, eq(inventoryItems.productId, products.id))
          .leftJoin(variant, eq(inventoryItems.productVariantId, variant.id))
          .where(onSale)
          .then(([row]) => row ?? { count: 0, outOfStock: 0 }),
        base()
          .orderBy(asc(inventoryItems.quantity), asc(products.title))
          .limit(limit),
      ]);

      return { ...summary, items };
    },

    /** Units sold per product in the period, leaving out cancelled and refunded orders. */
    topProducts: async ({ start, end, limit }: Period & { limit: number }) => {
      const units = sql<number>`sum(${orderItems.quantity})::int`;

      return db
        .select({
          productId: products.id,
          title: products.title,
          slug: products.slug,
          units,
          revenue: sql<number>`coalesce(sum(${lineTotal}), 0)::int`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .where(
          and(
            inArray(orders.status, ["PENDING", "SHIPPED", "DELIVERED"]),
            gte(orders.createdAt, start),
            lt(orders.createdAt, end),
          ),
        )
        .groupBy(products.id)
        .orderBy(desc(units), asc(products.title))
        .limit(limit);
    },

    /** The newest reviews written in the period. */
    latestReviews: async ({
      start,
      end,
      limit,
    }: Period & { limit: number }) => {
      return db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          productId: products.id,
          productTitle: products.title,
          authorName: users.name,
        })
        .from(reviews)
        .innerJoin(products, eq(reviews.productId, products.id))
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(and(gte(reviews.createdAt, start), lt(reviews.createdAt, end)))
        .orderBy(desc(reviews.createdAt), desc(reviews.id))
        .limit(limit);
    },
  },
};
