import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/server/db";
import {
  addresses,
  cartItems,
  orderItems,
  orders,
  productVariants,
  inventoryItems,
  productOptionValuesVariants,
  productOptions,
  productOptionValues,
  products,
  media,
} from "~/server/db/schema";
import { orderedOptionValues } from "../common/cte";
import type { Pagination } from "../common/types";
import {
  getCurrentUnitPrices,
  orderLineUnitPrice,
  withUnitPrices,
} from "../common/unit-prices";

type NewOrder = typeof orders.$inferInsert;
type NewOrderItem = typeof orderItems.$inferInsert;

export const _orders = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
      userId,
    }: Pagination & { userId: number }) => {
      const whereClause = [eq(orders.userId, userId)];
      if (cursor) {
        whereClause.push(lt(orders.id, cursor));
      }

      const productThumbnail = alias(media, "product_thumbnail");
      const variantThumbnail = alias(media, "variant_thumbnail");

      return db
        .select({
          id: orders.id,
          paymentMethod: orders.paymentMethod,
          status: orders.status,
          totalPrice:
            sql<number>`SUM(${orderItems.quantity} * ${orderLineUnitPrice})`.mapWith(
              Number,
            ),
          itemCount:
            sql<number>`coalesce(SUM(${orderItems.quantity}), 0)`.mapWith(
              Number,
            ),
          items: sql<{ title: string; thumbnailUrl: string | null }[]>`
            coalesce(
              jsonb_agg(
                jsonb_build_object(
                  'title', ${products.title},
                  'thumbnailUrl', coalesce(${variantThumbnail.url}, ${productThumbnail.url})
                )
                order by ${orderItems.id}
              ) filter (where ${orderItems.id} is not null),
              '[]'::jsonb
            )
          `,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
        })
        .from(orders)
        .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
        .leftJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .leftJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productThumbnail,
          eq(products.thumbnailMediaId, productThumbnail.id),
        )
        .leftJoin(
          variantThumbnail,
          eq(productVariants.thumbnailMediaId, variantThumbnail.id),
        )
        .where(and(...whereClause))
        .limit(pageSize)
        .orderBy(desc(orders.id))
        .groupBy(orders.id);
    },

    findById: async (id: number, userId: number) => {
      const variantValues = db.$with("variant_values").as(
        db
          .select({
            id: sql<number>`${productVariants.id}`.as("variant_values_id"),
            values: orderedOptionValues.as("values"),
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
          .leftJoin(
            productOptions,
            eq(productOptionValues.productOptionId, productOptions.id),
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

          price: sql`${orderLineUnitPrice}`.as("price"),
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
          status: orders.status,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,

          items: itemsJson.json,
          address: {
            fullName: addresses.fullName,
            phoneNumber: addresses.phoneNumber,
            address: addresses.address,
            buildingNameOrNumber: addresses.buildingNameOrNumber,
            city: addresses.city,
            governorate: addresses.governorate,
          },
        })
        .from(orders)
        .leftJoin(itemsJson, eq(orders.id, itemsJson.orderId))
        .leftJoin(addresses, eq(orders.addressId, addresses.id))
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

        // create order items at the current price
        const prices = await getCurrentUnitPrices(tx, items);
        const newOrderItems = await tx
          .insert(orderItems)
          .values(
            withUnitPrices(items, prices).map((item) => ({
              ...item,
              orderId: order.id,
            })),
          )
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
