import { sql, eq, gt, desc, and } from "drizzle-orm";
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

type InsertOrder = typeof orders.$inferInsert;
type InsertOrderItem = typeof orderItems.$inferInsert;

export const _orders = {
  queries: {
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
    findById: async (id: number) => {
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
          items: orderItemsVariantsJson.json,
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

        return order;
      });
    },
  },
};
