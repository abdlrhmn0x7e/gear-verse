import { AppError } from "~/lib/errors/app-error";
import { data } from "~/server/data-access";

export const _carts = {
  queries: {
    find: async (userId: number) => {
      let cart = await data.public.carts.queries.find(userId);
      if (!cart) {
        await data.public.carts.mutations.create({
          userId,
        });
        cart = await data.public.carts.queries.find(userId);
      }

      if (!cart) {
        throw new AppError("Cart not found", "NOT_FOUND");
      }

      return cart;
    },
  },
};
