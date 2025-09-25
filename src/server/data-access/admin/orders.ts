import { sql, eq, gt, desc, and } from "drizzle-orm";
import { db } from "~/server/db";
import {
  orderItems,
  productVariants,
  orders,
  addresses,
} from "~/server/db/schema";

type InsertOrder = typeof orders.$inferInsert;
type InsertOrderItem = typeof orderItems.$inferInsert;

export const _adminOrdersRepo = {
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
          sql<number>`SUM(${orderItems.quantity} * ${productVariants.overridePrice})`.as(
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
  findById: async ({ id }: { id: number }) => {
    return db.query.orders.findFirst({
      where: eq(orders.id, id),
      columns: {
        id: true,
        paymentMethod: true,
        status: true,
        phoneNumber: true,
        createdAt: true,
      },
      with: {
        user: {
          columns: {
            name: true,
            image: true,
          },
        },
        address: {
          columns: {
            city: true,
            governorate: true,
            address: true,
          },
        },
        items: {
          columns: {
            quantity: true,
          },
          with: {
            productVariant: {
              with: {
                thumbnail: {
                  columns: {
                    url: true,
                  },
                },
                product: {
                  columns: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },
  create: async (
    orderInput: InsertOrder,
    itemsInput: Omit<InsertOrderItem, "orderId">[],
  ) => {
    return db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values(orderInput)
        .returning({ id: orders.id });

      if (!order) {
        throw new Error("Failed to create order");
      }

      if (itemsInput.length > 0) {
        await tx
          .insert(orderItems)
          .values(itemsInput.map((item) => ({ ...item, orderId: order.id })));
      }

      return order;
    });
  },
};
