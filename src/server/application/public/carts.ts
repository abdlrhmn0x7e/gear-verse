import { AppError } from "~/lib/errors/app-error";
import type { NewCartItem } from "~/lib/schemas/entities/cart";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";

export const _carts = {
  queries: {
    find: async (userId: number) => {
      const { data: cart, error } = await tryCatch(
        data.public.carts.queries.find(userId),
      );
      if (error) {
        throw new AppError("Failed to find cart", "INTERNAL", {
          cause: error,
        });
      }

      // if there's no cart create one
      if (!cart) {
        const { data: newCart, error: newCartError } = await tryCatch(
          data.public.carts.mutations.create({
            userId,
          }),
        );
        if (newCartError || !newCart) {
          throw new AppError("Failed to create cart", "INTERNAL", {
            cause: newCartError,
          });
        }

        return { id: newCart.id, items: [] };
      }

      return cart;
    },

    getItemsStock: async (productVariantIds: number[]) => {
      const { data: itemsStock, error } = await tryCatch(
        data.public.inventory.queries.getItemsStock(productVariantIds),
      );
      if (error) {
        throw new AppError("Failed to get items stock", "INTERNAL", {
          cause: error,
        });
      }

      return itemsStock;
    },
  },

  mutations: {
    addItem: async ({
      userId,
      item,
    }: {
      userId: number;
      item: NewCartItem;
    }) => {
      const cart = await data.public.carts.queries.find(userId);
      if (!cart) {
        throw new AppError("Cart not found", "NOT_FOUND");
      }

      return data.public.carts.mutations.addItem({
        ...item,
        cartId: cart.id ?? 0,
      });
    },

    removeItem: async ({
      userId,
      productVariantId,
    }: {
      userId: number;
      productVariantId: number;
    }) => {
      const cart = await data.public.carts.queries.find(userId);
      if (!cart) {
        throw new AppError("Cart not found", "NOT_FOUND");
      }

      return data.public.carts.mutations.removeItem(cart.id, productVariantId);
    },
  },
};
