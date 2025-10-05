import { AppError } from "~/lib/errors/app-error";
import type { NewCartItem } from "~/lib/schemas/entities/cart";
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

  mutations: {
    addItem: async (userId: number, item: NewCartItem) => {
      const cart = await data.public.carts.queries.find(userId);
      if (!cart) {
        throw new AppError("Cart not found", "NOT_FOUND");
      }

      return data.public.carts.mutations.addItem({ ...item, cartId: cart.id });
    },

    removeItem: async (userId: number, productVariantId: number) => {
      const cart = await data.public.carts.queries.find(userId);
      if (!cart) {
        throw new AppError("Cart not found", "NOT_FOUND");
      }

      return data.public.carts.mutations.removeItem(cart.id, productVariantId);
    },
  },
};
