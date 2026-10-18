import { eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { orderItems, orders } from "~/server/db/schema";
import { reviews, users } from "~/server/db/schema";

export const _reviews = {
  queries: {
    findAll: async (productId: number) => {
      const isVerifiedPurchaserSubQuery = db
        .select({
          userId: orders.userId,
          // order items always carry the product id, with or without a variant
          verifiedPurchaser: sql<boolean>`
            coalesce(bool_or(${orderItems.productId} = ${productId}), false)
          `.as("verified_purchaser"),
        })
        .from(orders)
        .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(eq(orders.userId, reviews.userId))
        .groupBy(orders.userId)
        .as("is_verified_purchaser");

      return db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          user: {
            id: users.id,
            name: users.name,
            image: users.image,
            verifiedPurchaser: isVerifiedPurchaserSubQuery.verifiedPurchaser,
          },
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .leftJoinLateral(
          isVerifiedPurchaserSubQuery,
          eq(reviews.userId, isVerifiedPurchaserSubQuery.userId),
        )
        .where(eq(reviews.productId, productId));
    },
  },

  mutations: {
    delete: async (id: number) => {
      return db
        .delete(reviews)
        .where(eq(reviews.id, id))
        .returning({ id: reviews.id });
    },
  },
};
