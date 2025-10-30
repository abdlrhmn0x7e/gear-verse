import { data } from "~/server/data-access";
import { paginate } from "../helpers/pagination";
import { AppError } from "~/lib/errors/app-error";
import type { OrdersGetPageInput } from "~/lib/schemas/contracts/admin/orders";

export const _orders = {
  queries: {
    getPage: (input: OrdersGetPageInput) => {
      return paginate({ input, getPage: data.admin.orders.queries.getPage });
    },

    getCount: async () => {
      return data.admin.orders.queries.getCount();
    },

    findById: async (id: number) => {
      const order = await data.admin.orders.queries.findById(id);

      if (!order) {
        throw new AppError("Order not found", "NOT_FOUND");
      }

      return order;
    },
  },
};
