import { data } from "~/server/data-access";
import { AppError } from "~/lib/errors/app-error";

export const _orders = {
  queries: {
    findAll: async (userId: number) => {
      return data.public.orders.queries.findAll(userId);
    },
    findById: async (id: number, userId: number) => {
      const order = await data.public.orders.queries.findById(id, userId);
      if (!order) {
        throw new AppError("Order not found", "NOT_FOUND");
      }
      return order;
    },
  },
};
