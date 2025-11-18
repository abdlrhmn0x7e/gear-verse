import { data } from "~/server/data-access";
import { tryCatch } from "~/lib/utils/try-catch";
import { AppError } from "~/lib/errors/app-error";

export const _reviews = {
  queries: {
    findAll: async (productId: number) => {
      return data.admin.reviews.queries.findAll(productId);
    },
  },

  mutations: {
    delete: async (id: number) => {
      const { data: updatedReview, error } = await tryCatch(
        data.admin.reviews.mutations.delete(id),
      );

      if (error) {
        throw new AppError("Failed to delete review", "INTERNAL", {
          cause: error,
        });
      }

      if (!updatedReview) {
        throw new AppError("Failed to delete review", "NOT_FOUND", {
          cause: error,
        });
      }

      return updatedReview;
    },
  },
};
