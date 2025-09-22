import { and, eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { orderItems, orders } from "~/server/db/schema/orders";
import { productVariants } from "~/server/db/schema/product-variants";
import { reviews } from "~/server/db/schema/reviews";
import { users } from "~/server/db/schema/users";

type NewReview = typeof reviews.$inferInsert;
type UpdateReview = Partial<NewReview>;

export const _userReviewsRepository = {
  queries: {
    findAll: async (productId: number) => {
      const isVerifiedPurchaserSubQuery = db
        .select({
          userId: orders.userId,
          verifiedPurchaser: sql<boolean>`
            bool_or(product_variants.id IS NOT NULL)
          `.as("verified_purchaser"),
        })
        .from(orders)
        .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
        .leftJoin(
          productVariants,
          and(
            eq(orderItems.productVariantId, productVariants.id),
            eq(productVariants.productId, productId),
          ),
        )
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
    create: async (review: NewReview) => {
      return db.insert(reviews).values(review).onConflictDoNothing();
    },

    update: async (id: number, userId: number, review: UpdateReview) => {
      return db
        .update(reviews)
        .set(review)
        .where(and(eq(reviews.userId, userId), eq(reviews.id, id)));
    },
  },
};
