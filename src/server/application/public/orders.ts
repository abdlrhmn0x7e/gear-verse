import { data } from "~/server/data-access";
import { AppError } from "~/lib/errors/app-error";
import { tryCatch } from "~/lib/utils/try-catch";
import type { OrdersGetPageInput } from "~/lib/schemas/contracts/public/orders";
import { paginate } from "../helpers/pagination";

export const _orders = {
  queries: {
    getPage: async (input: OrdersGetPageInput & { userId: number }) => {
      return paginate({ input, getPage: data.public.orders.queries.getPage });
    },

    findById: async (id: number, userId: number) => {
      const { data: order, error } = await tryCatch(
        data.public.orders.queries.findById(id, userId),
      );

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
