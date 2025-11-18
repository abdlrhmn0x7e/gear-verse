import { sql, eq, gt, desc, and, ilike, isNull } from "drizzle-orm";
import { db } from "~/server/db";
import {
  orderItems,
  productVariants,
  orders,
  addresses,
  productOptionValuesVariants,
  productOptionValues,
  productOptions,
  products,
  inventoryItems,
  media,
  users,
} from "~/server/db/schema";
import type { Pagination } from "../common/types";

type InsertOrder = typeof orders.$inferInsert;
type InsertOrderItem = typeof orderItems.$inferInsert;

type UpdateOrder = Partial<InsertOrder>;
type UpdateOrderItem = Omit<InsertOrderItem, "orderId">;

export const _orders = {
  queries: {
    getPage: async ({
      pageSize,
      cursor,
      filters,
    }: Pagination<{
      phoneNumber: string;
      status: "PENDING" | "SHIPPED" | "DELIVERED" | "REFUNDED" | "CANCELLED";
      paymentMethod: "COD" | "ONLINE";
    }>) => {
      const whereClause = [gt(orders.id, cursor ?? 0)];
      if (filters?.phoneNumber) {
        whereClause.push(
          ilike(addresses.phoneNumber, `%${filters.phoneNumber}%`),
        );
      }
      if (filters?.status) {
        whereClause.push(eq(orders.status, filters.status));
      }
      if (filters?.paymentMethod) {
        whereClause.push(eq(orders.paymentMethod, filters.paymentMethod));
      }

      const totalValueCTE = db.$with("total_value_cte").as(
        db
          .select({
            orderId: orders.id,
            totalValue:
              sql<number>`SUM(${orderItems.quantity} * coalesce(${productVariants.overridePrice}, ${products.price}))`.as(
                "totalValue",
              ),
          })
          .from(orders)
          .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
          .leftJoin(
            productVariants,
            eq(orderItems.productVariantId, productVariants.id),
          )
          .leftJoin(products, eq(productVariants.productId, products.id))
          .groupBy(orders.id),
      );

      return db
        .with(totalValueCTE)
        .select({
          id: orders.id,
          paymentMethod: orders.paymentMethod,
          status: orders.status,
          totalValue: totalValueCTE.totalValue,
          address: sql<string>`concat(${addresses.city}, ', ', ${addresses.governorate})`,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(addresses, eq(orders.addressId, addresses.id))
        .leftJoin(totalValueCTE, eq(orders.id, totalValueCTE.orderId))
        .where(and(...whereClause))
        .orderBy(desc(orders.id))
        .limit(pageSize);
    },

    findById: async (id: number) => {
      type OrderItem = {
        id: number;
        quantity: number;
        productId: number;
        productVariantId: number;
      };

      const orderItemsJsonCTE = db.$with("order_items_cte").as(
        db
          .select({
            orderId: orderItems.orderId,
            json: sql<OrderItem[]>`
            jsonb_agg(
              jsonb_build_object(
                'id', ${orderItems.id},
                'quantity', ${orderItems.quantity},
                'productId', ${orderItems.productId},
                'productVariantId', ${orderItems.productVariantId}
              )
            )
          `.as("items"),
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, id))
          .groupBy(orderItems.orderId),
      );

      return db
        .with(orderItemsJsonCTE)
        .select({
          status: orders.status,
          paymentMethod: orders.paymentMethod,
          userId: orders.userId,
          addressId: orders.addressId,
          items: orderItemsJsonCTE.json,
        })
        .from(orders)
        .where(eq(orders.id, id))
        .leftJoin(orderItemsJsonCTE, eq(orders.id, orderItemsJsonCTE.orderId))
        .limit(1)
        .then(([res]) => res);
    },

    findDetailsById: async (id: number) => {
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
          eq(productVariants.id, inventoryItems.productVariantId),
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
          status: orders.status,
          address: {
            phoneNumber: addresses.phoneNumber,
            address: addresses.address,
            city: addresses.city,
            governorate: addresses.governorate,
          },
          user: {
            name: users.name,
            image: users.image,
          },
          items: sql<
            OrderItem[]
          >`coalesce(${orderItemsVariantsJson.json}, '[]'::jsonb)`,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(addresses, eq(orders.addressId, addresses.id))
        .leftJoin(
          orderItemsVariantsJson,
          eq(orders.id, orderItemsVariantsJson.id),
        )
        .where(eq(orders.id, id))
        .limit(1)
        .then(([res]) => res);
    },

    getCount: async () => {
      return db.$count(orders, eq(orders.status, "PENDING"));
    },
  },

  mutations: {
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

        // update the product variants stock
        for (const item of itemsInput) {
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

    update: async (
      id: number,
      orderInput?: UpdateOrder,
      itemsInput?: UpdateOrderItem[],
    ) => {
      return db.transaction(async (tx) => {
        if (orderInput && Object.keys(orderInput).length > 0) {
          await tx.update(orders).set(orderInput).where(eq(orders.id, id));
        }

        if (itemsInput && itemsInput.length > 0) {
          // delete the old items
          const deleted = await tx
            .delete(orderItems)
            .where(eq(orderItems.orderId, id))
            .returning({
              quantity: orderItems.quantity,
              productId: orderItems.productId,
              productVariantId: orderItems.productVariantId,
            });

          // create the new items
          const created = await tx
            .insert(orderItems)
            .values(itemsInput.map((item) => ({ ...item, orderId: id })))
            .returning({
              quantity: orderItems.quantity,
              productId: orderItems.productId,
              productVariantId: orderItems.productVariantId,
            });

          // create a map for the diff between quantities and update the stock
          const diffMap = new Map<string, number>();
          deleted.forEach((item) =>
            diffMap.set(
              `item-${item.productId}-${item.productVariantId}`,
              item.quantity,
            ),
          );
          created.forEach((item) => {
            const old = diffMap.get(
              `item-${item.productId}-${item.productVariantId}`,
            );
            if (old) {
              diffMap.set(
                `item-${item.productId}-${item.productVariantId}`,
                old - item.quantity,
              );
              return;
            }

            diffMap.set(
              `item-${item.productId}-${item.productVariantId}`,
              item.quantity,
            );
          });

          console.log("Diff Map:", diffMap);

          for (const [key, quantity] of Array.from(diffMap.entries())) {
            const productId = Number(key.split("-")[1]);
            const productVariantId = Number(key.split("-")[2]);

            if (isNaN(productId)) {
              throw new Error("A product id must be a number");
            }

            const preds = [eq(inventoryItems.productId, productId)];
            if (isNaN(productVariantId)) {
              preds.push(isNull(inventoryItems.productVariantId));
            } else {
              preds.push(eq(inventoryItems.productVariantId, productVariantId));
            }

            console.log("Updating inventory item ", quantity);
            await tx
              .update(inventoryItems)
              .set({
                quantity: sql`${inventoryItems.quantity} + (${quantity})`,
              })
              .where(and(...preds));
          }
        }

        return { id };
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

    delete: async (id: number) => {
      return db
        .delete(orders)
        .where(eq(orders.id, id))
        .returning({ id: orders.id })
        .then(([res]) => res);
    },
  },
};
