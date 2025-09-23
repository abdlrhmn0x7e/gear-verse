import { sql, eq, gt, desc, and } from "drizzle-orm";
import { db } from "~/server/db";
import {
  orderItems,
  productVariants,
  orders,
  addresses,
} from "~/server/db/schema";

export const _adminOrdersRepository = {
  getPage: async ({
    pageSize,
    cursor,
    filters,
  }: {
    pageSize: number;
    cursor: number | undefined;
    filters?: Partial<{
      orderId: number;
      status: "PENDING" | "SHIPPED" | "DELIVERED" | "REFUNDED" | "CANCELLED";
      paymentMethod: "COD";
    }>;
  }) => {
    const whereClause = [gt(orders.id, cursor ?? 0)];
    if (filters?.orderId) {
      whereClause.push(gt(orders.id, filters.orderId));
    }
    if (filters?.status) {
      whereClause.push(eq(orders.status, filters.status));
    }
    if (filters?.paymentMethod) {
      whereClause.push(eq(orders.paymentMethod, filters.paymentMethod));
    }

    const totalValueSubQuery = db
      .select({
        totalValue:
          sql<number>`SUM(${orderItems.quantity} * ${productVariants.price})`.as(
            "totalValue",
          ),
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(
        productVariants,
        eq(orderItems.productVariantId, productVariants.id),
      )
      .groupBy(orders.id)
      .as("totalValueSubQuery");

    return db
      .select({
        id: orders.id,
        paymentMethod: orders.paymentMethod,
        status: orders.status,
        totalValue: totalValueSubQuery.totalValue,
        address: sql<string>`concat(${addresses.city}, ', ', ${addresses.governorate})`,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(addresses, eq(orders.addressId, addresses.id))
      .leftJoinLateral(totalValueSubQuery, sql`true`)
      .where(and(...whereClause))
      .orderBy(desc(orders.id))
      .limit(pageSize);
  },
};
