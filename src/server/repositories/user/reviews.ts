import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { reviews } from "~/server/db/schema/reviews";

type NewReview = typeof reviews.$inferInsert;

export const _reviewsRepository = {
  queries: {
    findAll: async (productId: number) => {
      return db.select().from(reviews).where(eq(reviews.productId, productId));
    },
  },
  mutations: {
    create: async (review: NewReview) => {
      return db.insert(reviews).values(review).returning();
    },
  },
};
