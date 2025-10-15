import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  cartItems,
  orderItems,
  orders,
  productVariants,
  inventoryItems,
  productOptionValuesVariants,
  productOptionValues,
  productOptions,
  products,
  media,
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
          totalPrice: sql<number>`SUM(${orderItems.quantity} * coalesce(${productVariants.overridePrice}, ${products.price}))`,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
        .leftJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .leftJoin(products, eq(productVariants.productId, products.id))
        .where(eq(orders.userId, userId))
        .groupBy(orders.id);
    },

    findById: async (id: number, userId: number) => {
      const variantValues = db
        .select({
          productVariantId: productOptionValuesVariants.productVariantId,
          json: sql<string[]>`
            jsonb_agg(${productOptionValues.value})
          `.as("values"),
        })
        .from(productOptionValues)
        .leftJoin(
          productOptionValuesVariants,
          eq(
            productOptionValues.id,
            productOptionValuesVariants.productOptionValueId,
          ),
        )
        .leftJoin(
          productOptions,
          eq(productOptionValues.productOptionId, productOptions.id),
        )
        .groupBy(productOptionValuesVariants.productVariantId)
        .as("variant_option_values");

      const orderItemsVariants = db
        .select({
          id: productVariants.id,
          title: products.title,
          summary: products.summary,
          price:
            sql`coalesce(${productVariants.overridePrice}, ${products.price})`.as(
              "price",
            ),
          stock: sql`${inventoryItems.quantity}`.as("stock"),
          thumbnailUrl: media.url,
          values: variantValues.json,
        })
        .from(productVariants)
        .leftJoin(
          inventoryItems,
          eq(productVariants.id, inventoryItems.variantId),
        )
        .leftJoin(media, eq(productVariants.thumbnailMediaId, media.id))
        .leftJoin(
          variantValues,
          eq(productVariants.id, variantValues.productVariantId),
        )
        .leftJoin(products, eq(productVariants.productId, products.id))
        .orderBy(desc(productVariants.id))
        .as("variants");

      type OrderItem = {
        id: number;
        quantity: number;
        stock: number;
        title: string;
        price: number;
        summary: string;
        thumbnailUrl: string;
        values: string[];
      };

      const orderItemsVariantsJson = db
        .select({
          id: orderItems.orderId,
          json: sql<OrderItem[]>`
            jsonb_agg(
              jsonb_build_object(
                'id', ${orderItemsVariants.id},
                'quantity', ${orderItems.quantity},
                'stock', ${orderItemsVariants.stock},
                'title', ${orderItemsVariants.title},
                'summary', ${orderItemsVariants.summary},
                'price', ${orderItemsVariants.price},
                'thumbnailUrl', ${orderItemsVariants.thumbnailUrl},
                'values', ${orderItemsVariants.values}
              )
            )
          `.as("items"),
        })
        .from(orderItemsVariants)
        .leftJoin(
          orderItems,
          eq(orderItems.productVariantId, orderItemsVariants.id),
        )
        .groupBy(orderItems.orderId)
        .as("order_variants_json");

      return db
        .select({
          id: orders.id,
          paymentMethod: orders.paymentMethod,

          items: orderItemsVariantsJson.json,
        })
        .from(orders)
        .leftJoin(
          orderItemsVariantsJson,
          eq(orders.id, orderItemsVariantsJson.id),
        )
        .where(and(eq(orders.id, id), eq(orders.userId, userId)))
        .limit(1)
        .then(([res]) => res);
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
            .update(inventoryItems)
            .set({
              quantity: sql`${inventoryItems.quantity} - ${item.quantity}`,
            })
            .where(eq(inventoryItems.variantId, item.productVariantId));
        }

        return order;
      });
    },

    moveOwnership: async (oldUserId: number, newUserId: number) => {
      return db
        .update(orders)
        .set({ userId: newUserId })
        .where(eq(orders.userId, oldUserId))
        .returning({ id: orders.id })
        .then(([res]) => res);
    },
  },
};
