import { data } from "~/server/data-access";
import {
  type CreateReviewInput,
  type UpdateReviewInput,
} from "~/lib/schemas/entities/reviews";
import { tryCatch } from "~/lib/utils/try-catch";
import { AppError } from "~/lib/errors/app-error";

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
      const { data: createdReview, error } = await tryCatch(
        data.public.reviews.mutations.create({
          ...review,
          userId,
          productId,
        }),
      );

      if (error) {
        throw new AppError("Failed to create review", "CONFLICT", {
          cause: error,
        });
      }

      return createdReview;
    },

    update: async (id: number, userId: number, review: UpdateReviewInput) => {
      const { data: updatedReview, error } = await tryCatch(
        data.public.reviews.mutations.update(id, userId, review),
      );

      if (error) {
        throw new AppError("Failed to update review", "INTERNAL", {
          cause: error,
        });
      }

      if (!updatedReview) {
        throw new AppError("Failed to update review", "NOT_FOUND", {
          cause: error,
        });
      }

      return updatedReview;
    },
  },
};
