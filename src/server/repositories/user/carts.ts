import { db } from "~/server/db";
import { cartItems, carts, productVariants } from "~/server/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

type NewCart = typeof carts.$inferInsert;
type NewCartItem = typeof cartItems.$inferInsert;

export const _userCartsRepository = {
  queries: {
    findCartId: async (userId: number) => {
      return db
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1)
        .then((res) => res[0]);
    },

    find: async (userId: number) => {
      return db.query.carts.findFirst({
        columns: { id: true },
        where: eq(carts.userId, userId),
        with: {
          items: {
            columns: {
              quantity: true,
            },
            with: {
              productVariant: {
                columns: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                },
                with: {
                  thumbnail: {
                    columns: {
                      url: true,
                    },
                  },

                  product: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    },
  },

  mutations: {
    create: async (cart: NewCart) => {
      return db
        .insert(carts)
        .values(cart)
        .returning({ id: carts.id })
        .then((res) => res[0]);
    },

    addItem: async (item: NewCartItem) => {
      return db.transaction(async (tx) => {
        const [variant] = await tx
          .select({ stock: productVariants.stock })
          .from(productVariants)
          .where(eq(productVariants.id, item.productVariantId))
          .limit(1);

        if (!variant) {
          throw new Error("Product variant not found");
        }

        if (variant.stock <= 0) {
          throw new Error("Product variant out of stock");
        }

        const [updated] = await tx
          .insert(cartItems)
          .values(item)
          .onConflictDoUpdate({
            target: [cartItems.cartId, cartItems.productVariantId],
            set: {
              quantity: sql`${cartItems.quantity} + 1`,
            },
          })
          .returning({ id: cartItems.id, quantity: cartItems.quantity });

        if (variant.stock < (updated?.quantity ?? 1)) {
          throw new Error("Product variant out of stock");
        }

        return updated;
      });
    },

    removeItem: async (cartId: number, productVariantId: number) => {
      return db.transaction(async (tx) => {
        const [updated] = await tx
          .update(cartItems)
          .set({ quantity: sql`${cartItems.quantity} - 1` })
          .where(
            and(
              eq(cartItems.cartId, cartId),
              eq(cartItems.productVariantId, productVariantId),
              gt(cartItems.quantity, 1),
            ),
          )
          .returning({ id: cartItems.id });

        if (updated) {
          return;
        }

        return tx
          .delete(cartItems)
          .where(
            and(
              eq(cartItems.cartId, cartId),
              eq(cartItems.productVariantId, productVariantId),
            ),
          );
      });
    },
  },
};
