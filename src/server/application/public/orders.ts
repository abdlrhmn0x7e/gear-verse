import { data } from "~/server/data-access";

export const _orders = {
  queries: {
    findAll: async (userId: number) => {
      return data.public.orders.queries.findAll(userId);
    },
    findById: async (id: number, userId: number) => {
      return data.public.orders.queries.findById(id, userId);
    },
  },
};
