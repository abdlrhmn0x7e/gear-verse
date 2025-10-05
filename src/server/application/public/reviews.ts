import { data } from "~/server/data-access";
import { type CreateReviewInput } from "~/lib/schemas/entities/reviews";

export const _reviews = {
  queries: {
    findAll: async (productId: number) => {
      return data.public.reviews.queries.findAll(productId);
    },
  },

  mutations: {
    create: async (
      review: CreateReviewInput,
      userId: number,
      productId: number,
    ) => {
      return data.public.reviews.mutations.create({
        ...review,
        userId,
        productId,
      });
    },
  },
};
