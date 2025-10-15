import { data } from "~/server/data-access";
import { AppError } from "~/lib/errors/app-error";
import { tryCatch } from "~/lib/utils/try-catch";

export const _orders = {
  queries: {
    findAll: async (userId: number) => {
      return data.public.orders.queries.findAll(userId);
    },

    findById: async (id: number, userId: number) => {
      const { data: order, error } = await tryCatch(
        data.public.orders.queries.findById(id, userId),
      );
      console.log("order", order);

      if (error) {
        throw new AppError("Could not get your order", "INTERNAL", {
          cause: error,
        });
      }

      if (!order) {
        throw new AppError("Order not found", "NOT_FOUND");
      }

      return order;
    },
  },
};
