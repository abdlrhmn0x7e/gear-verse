import { and, eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  cartItems,
  orderItems,
  orders,
  productVariants,
} from "~/server/db/schema";

type NewOrder = typeof orders.$inferInsert;
type NewOrderItem = typeof orderItems.$inferInsert;

export const _orders = {
  queries: {
    findAll: async (userId: number) => {
      return db
        .select({
          id: orders.id,
          paymentMethod: orders.paymentMethod,
          status: orders.status,
          totalPrice: sql<number>`SUM(${orderItems.quantity} * ${productVariants.overridePrice})`,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
        .leftJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .where(eq(orders.userId, userId))
        .groupBy(orders.id);
    },
    findById: async (id: number, userId: number) => {
      return db.query.orders.findFirst({
        where: and(eq(orders.id, id), eq(orders.userId, userId)),
        columns: {
          id: true,
          paymentMethod: true,
        },
        with: {
          items: {
            columns: {
              quantity: true,
            },
            with: {
              productVariant: {
                columns: {
                  overridePrice: true,
                },
                with: {
                  product: {
                    columns: {
                      summary: true,
                    },
                  },
                  thumbnail: {
                    columns: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    },
  },
  mutations: {
    create: async (
      input: NewOrder,
      items: Omit<NewOrderItem, "orderId">[],
      cartId: number,
    ) => {
      return db.transaction(async (tx) => {
        // create order
        const [order] = await tx
          .insert(orders)
          .values(input)
          .returning({ id: orders.id });
        if (!order) {
          throw new Error("Failed to create order");
        }

        // create order items
        const newOrderItems = await tx
          .insert(orderItems)
          .values(items.map((item) => ({ ...item, orderId: order.id })))
          .returning({ id: orderItems.id });
        if (!newOrderItems) {
          throw new Error("Failed to create order items");
        }

        // clear the cart
        await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));

        // update the product variants stock
        for (const item of items) {
          await tx
            .update(productVariants)
            .set({
              quantity: sql`${productVariants.quantity} - ${item.quantity}`,
            })
            .where(eq(productVariants.id, item.productVariantId));
        }

        return order;
      });
    },
  },
};
