import { and, desc, eq, gte, not, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { orderItems, orders } from "~/server/db/schema";
import { products, reviews, users } from "~/server/db/schema";

type NewReview = typeof reviews.$inferInsert;
type UpdateReview = Partial<NewReview>;

/** Shorter comments ("good", "10/10") say little to someone deciding, so the store-wide picks skip them. */
const FEATURED_MIN_COMMENT_LENGTH = 20;

export const _reviews = {
  queries: {
    /** The newest 4- and 5-star reviews with something to say, from signed-up customers, on live products. */
    findFeatured: async (limit: number) => {
      return db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          name: users.name,
          product: { title: products.title, slug: products.slug },
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.userId, users.id))
        .innerJoin(products, eq(reviews.productId, products.id))
        .where(
          and(
            gte(reviews.rating, 4),
            not(products.archived),
            sql`coalesce(${users.isAnonymous}, false) = false`,
            sql`char_length(trim(${reviews.comment})) >= ${FEATURED_MIN_COMMENT_LENGTH}`,
          ),
        )
        .orderBy(desc(reviews.createdAt))
        .limit(limit);
    },

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
    create: async (review: NewReview) => {
      return db.insert(reviews).values(review);
    },

    update: async (id: number, userId: number, review: UpdateReview) => {
      return db
        .update(reviews)
        .set(review)
        .where(and(eq(reviews.userId, userId), eq(reviews.id, id)))
        .returning({ id: reviews.id });
    },

    delete: async (id: number, userId: number) => {
      return db
        .delete(reviews)
        .where(and(eq(reviews.userId, userId), eq(reviews.id, id)))
        .returning({ id: reviews.id });
    },
  },
};
