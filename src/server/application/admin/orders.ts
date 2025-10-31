import { data } from "~/server/data-access";
import { paginate } from "../helpers/pagination";
import { AppError } from "~/lib/errors/app-error";
import type { OrdersGetPageInput } from "~/lib/schemas/contracts/admin/orders";
import type {
  CreateFullOrderInput,
  UpdateFullOrderInput,
} from "~/lib/schemas/entities";
import { tryCatch } from "~/lib/utils/try-catch";

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

    findDetailsById: async (id: number) => {
      const order = await data.admin.orders.queries.findDetailsById(id);

      if (!order) {
        throw new AppError("Order not found", "NOT_FOUND");
      }

      return order;
    },
  },

  mutations: {
    create: async (input: CreateFullOrderInput) => {
      const { items, ...order } = input;
      const { data: newOrder, error } = await tryCatch(
        data.admin.orders.mutations.create(order, items),
      );
      if (error) {
        throw new AppError("Failed to create order", "INTERNAL", {
          cause: error,
        });
      }
      return newOrder;
    },

    update: async (input: UpdateFullOrderInput & { id: number }) => {
      console.log("input", input);
      const { id, items, ...order } = input;
      const { data: updatedOrder, error } = await tryCatch(
        data.admin.orders.mutations.update(id, order, items),
      );
      if (error) {
        console.error("ERROR: ", error);
        throw new AppError("Failed to update order", "INTERNAL", {
          cause: error,
        });
      }

      return updatedOrder;
    },

    delete: async (id: number) => {
      const { data: deletedOrder, error } = await tryCatch(
        data.admin.orders.mutations.delete(id),
      );
      if (error) {
        console.error("ERROR: ", error);
        throw new AppError("Failed to delete order", "INTERNAL", {
          cause: error,
        });
      }
      return deletedOrder;
    },
  },
};
