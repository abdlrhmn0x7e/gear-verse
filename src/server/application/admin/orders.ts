import { data } from "~/server/data-access";
import { paginate } from "../helpers/pagination";
import { AppError } from "~/lib/errors/app-error";
import type { OrdersGetPageInput } from "~/lib/schemas/contracts/admin/orders";
import type {
  CreateFullOrderInput,
  UpdateFullOrderInput,
} from "~/lib/schemas/entities";
import { tryCatch } from "~/lib/utils/try-catch";
import { invalidateProducts } from "~/server/actions/cache";

/** An order may only ship to one of its own customer's addresses. */
async function assertAddressBelongsToUser(addressId: number, userId: number) {
  const ownerId = await data.admin.addresses.queries.findOwnerId(addressId);

  if (ownerId === undefined) {
    throw new AppError("That address doesn't exist", "BAD_REQUEST");
  }

  if (ownerId !== userId) {
    throw new AppError(
      "That address belongs to a different customer. Pick one of this customer's addresses.",
      "BAD_REQUEST",
    );
  }
}

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
      await assertAddressBelongsToUser(order.addressId, order.userId);

      const { data: newOrder, error } = await tryCatch(
        data.admin.orders.mutations.create(order, items),
      );
      if (error) {
        throw new AppError("Failed to create order", "INTERNAL", {
          cause: error,
        });
      }

      await invalidateProducts(items.map((item) => item.productId));
      return newOrder;
    },

    update: async (input: UpdateFullOrderInput & { id: number }) => {
      const { id, items, ...order } = input;

      // the form only sends dirty fields, so check the address against the
      // order's current customer unless the customer is changing too
      if (order.userId !== undefined || order.addressId !== undefined) {
        const current = await data.admin.orders.queries.findOwnership(id);
        if (!current) {
          throw new AppError("Order not found", "NOT_FOUND");
        }

        await assertAddressBelongsToUser(
          order.addressId ?? current.addressId,
          order.userId ?? current.userId,
        );
      }

      const { data: updatedOrder, error } = await tryCatch(
        data.admin.orders.mutations.update(id, order, items),
      );
      if (error) {
        console.error("ERROR: ", error);
        throw new AppError("Failed to update order", "INTERNAL", {
          cause: error,
        });
      }

      if (items) {
        await invalidateProducts(items.map((item) => item.productId));
      }
      return updatedOrder;
    },

    delete: async (id: number) => {
      const { data: deleted, error } = await tryCatch(
        data.admin.orders.mutations.delete(id),
      );
      if (error) {
        throw new AppError("Failed to delete order", "INTERNAL", {
          cause: error,
        });
      }
      await invalidateProducts(deleted.map((item) => item.productId));

      return { id };
    },
  },
};
