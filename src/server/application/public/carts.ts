import { AppError } from "~/lib/errors/app-error";
import type { NewCartItem } from "~/lib/schemas/entities/cart";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";

export const _carts = {
  queries: {
    find: async ({ cartId, userId }: { cartId?: number; userId?: number }) => {
      if (!cartId) {
        const { data: cart, error } = await tryCatch(
          data.public.carts.mutations.create({
            userId,
          }),
        );

        if (error || !cart) {
          console.error("create cart error", error);
          throw new AppError("Failed to create cart", "INTERNAL", {
            cause: error,
          });
        }

        return { id: cart.id, items: [] };
      }

      const { data: cart, error } = await tryCatch(
        data.public.carts.queries.find(cartId, userId),
      );
      if (error) {
        throw new AppError("Cart not found", "NOT_FOUND", {
          cause: error,
        });
      }

      // the user had a guest cart and logged in
      // the guest cart must be claimed
      if (!cart && userId) {
        const { data: cart, error } = await tryCatch(
          data.public.carts.mutations.associateWithUser(cartId, userId),
        );

        if (error || !cart) {
          throw new AppError("Failed to associate cart with user", "INTERNAL", {
            cause: error,
          });
        }

        return { id: cart.id, items: [] };
      }

      return cart;
    },

    getItemsStock: async (productVariantIds: number[]) => {
      return data.public.inventory.queries.getItemsStock(productVariantIds);
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
