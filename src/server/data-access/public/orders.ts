import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/server/db";
import {
  cartItems,
  orderItems,
  orders,
  productVariants,
  inventoryItems,
  productOptionValuesVariants,
  productOptionValues,
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
      const variantValues = db.$with("variant_values").as(
        db
          .select({
            id: sql<number>`${productVariants.id}`.as("variant_values_id"),
            values: sql<string[]>`
            jsonb_agg(${productOptionValues.value})
          `.as("values"),
          })
          .from(productVariants)
          .leftJoin(
            productOptionValuesVariants,
            eq(
              productVariants.id,
              productOptionValuesVariants.productVariantId,
            ),
          )
          .leftJoin(
            productOptionValues,
            eq(
              productOptionValuesVariants.productOptionValueId,
              productOptionValues.id,
            ),
          )
          .groupBy(productVariants.id),
      );

      const variantsInventory = alias(inventoryItems, "variants_inventory");
      const productsInventory = alias(inventoryItems, "products_inventory");
      const productThumbnail = alias(media, "product_thumbnail");
      const variantThumbnail = alias(media, "variant_thumbnail");

      const items = db
        .with(variantValues)
        .select({
          id: sql<number>`${orderItems.id}`.as("order_item_id"),
          orderId: sql<number>`${orderItems.orderId}`.as("order_item_order_id"),

          quantity: orderItems.quantity,
          productId: sql<number>`${products.id}`.as("order_item_product_id"),
          title: products.title,
          summary: products.summary,

          productVariantId: sql<number>`${productVariants.id}`.as(
            "order_item_product_variant_id",
          ),
          values: variantValues.values,

          price:
            sql`coalesce(${productVariants.overridePrice}, ${products.price})`.as(
              "price",
            ),
          thumbnailUrl:
            sql`coalesce(${variantThumbnail.url}, ${productThumbnail.url})`.as(
              "thumbnailUrl",
            ),

          stock:
            sql`coalesce(${variantsInventory.quantity}, ${productsInventory.quantity})`.as(
              "stock",
            ),
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productVariants,
          and(
            eq(products.id, productVariants.productId),
            eq(orderItems.productVariantId, productVariants.id),
          ),
        )
        .leftJoin(variantValues, eq(productVariants.id, variantValues.id))

        .leftJoin(
          variantsInventory,
          and(
            eq(variantsInventory.productId, products.id),
            eq(variantsInventory.productVariantId, productVariants.id),
          ),
        )
        .leftJoin(
          productsInventory,
          and(
            eq(productsInventory.productId, products.id),
            isNull(productsInventory.productVariantId),
          ),
        )

        .leftJoin(
          productThumbnail,
          eq(products.thumbnailMediaId, productThumbnail.id),
        )

        .leftJoin(
          variantThumbnail,
          eq(productVariants.thumbnailMediaId, variantThumbnail.id),
        )
        .orderBy(desc(orderItems.id))
        .as("items");

      type OrderItem = {
        id: number;

        productId: number;
        title: string;
        summary: string;

        productVariantId: number | null;

        quantity: number;
        stock: number;

        price: number;
        thumbnailUrl: string;

        values: string[] | null;
      };

      const itemsJson = db
        .select({
          orderId: items.orderId,
          json: sql<OrderItem[]>`
            jsonb_agg(
              jsonb_build_object(
                'id', ${items.id},
                'quantity', ${items.quantity},
                'productId', ${items.productId},
                'productVariantId', ${items.productVariantId},
                'stock', ${items.stock},
                'title', ${items.title},
                'summary', ${items.summary},
                'price', ${items.price},
                'thumbnailUrl', ${items.thumbnailUrl},
                'values', ${items.values}
              )
            )
        `.as("json"),
        })
        .from(items)
        .groupBy(items.orderId)
        .as("items_json");

      return db
        .select({
          id: orders.id,
          paymentMethod: orders.paymentMethod,

          items: itemsJson.json,
        })
        .from(orders)
        .leftJoin(itemsJson, eq(orders.id, itemsJson.orderId))
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
          if (item.productVariantId) {
            await tx
              .update(inventoryItems)
              .set({
                quantity: sql`${inventoryItems.quantity} - ${item.quantity}`,
              })
              .where(
                and(
                  eq(inventoryItems.productId, item.productId),
                  eq(inventoryItems.productVariantId, item.productVariantId),
                ),
              );

            continue;
          }

          await tx
            .update(inventoryItems)
            .set({
              quantity: sql`${inventoryItems.quantity} - ${item.quantity}`,
            })
            .where(
              and(
                eq(inventoryItems.productId, item.productId),
                isNull(inventoryItems.productVariantId),
              ),
            );
        }

        return order;
      });
    },
  },
};
