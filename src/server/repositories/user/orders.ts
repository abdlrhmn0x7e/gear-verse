import { eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  cartItems,
  orderItems,
  orders,
  productVariants,
} from "~/server/db/schema";

type NewOrder = typeof orders.$inferInsert;
type NewOrderItem = typeof orderItems.$inferInsert;

export const _userOrdersRepository = {
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
            .set({ stock: sql`${productVariants.stock} - ${item.quantity}` })
            .where(eq(productVariants.id, item.productVariantId));
        }

        return order;
      });
    },
  },
};
