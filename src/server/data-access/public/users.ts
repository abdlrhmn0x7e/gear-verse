import { and, eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import {
  addresses,
  cartItems,
  carts,
  inventoryItems,
  orders,
  reviews,
  users,
} from "~/server/db/schema";
import { cartLineKey, mergeCartLines } from "../common/merge-cart-lines";

export const _users = {
  mutations: {
    /**
     * Hands everything an anonymous visitor owns over to the account they
     * signed in with, then deletes the anonymous user. Runs in one
     * transaction so a failure leaves both users untouched.
     */
    mergeAnonymous: async (anonymousUserId: number, userId: number) => {
      return db.transaction(async (tx) => {
        const [guestCart] = await tx
          .select({ id: carts.id })
          .from(carts)
          .where(eq(carts.userId, anonymousUserId))
          .limit(1);
        const [userCart] = await tx
          .select({ id: carts.id })
          .from(carts)
          .where(eq(carts.userId, userId))
          .limit(1);

        if (guestCart && !userCart) {
          await tx
            .update(carts)
            .set({ userId })
            .where(eq(carts.id, guestCart.id));
        }

        // a returning user keeps their cart, the guest's lines are merged in
        if (guestCart && userCart) {
          const lineColumns = {
            productId: cartItems.productId,
            productVariantId: cartItems.productVariantId,
            quantity: cartItems.quantity,
          };
          const guestLines = await tx
            .select(lineColumns)
            .from(cartItems)
            .where(eq(cartItems.cartId, guestCart.id));
          const userLines = await tx
            .select({ id: cartItems.id, ...lineColumns })
            .from(cartItems)
            .where(eq(cartItems.cartId, userCart.id));

          const stock =
            guestLines.length > 0
              ? await tx
                  .select({
                    productId: inventoryItems.productId,
                    productVariantId: inventoryItems.productVariantId,
                    quantity: inventoryItems.quantity,
                  })
                  .from(inventoryItems)
                  .where(
                    inArray(
                      inventoryItems.productId,
                      guestLines.map((line) => line.productId),
                    ),
                  )
              : [];

          const { toUpdate, toInsert } = mergeCartLines(
            userLines,
            guestLines,
            new Map(stock.map((item) => [cartLineKey(item), item.quantity])),
          );

          for (const line of toUpdate) {
            await tx
              .update(cartItems)
              .set({ quantity: line.quantity })
              .where(eq(cartItems.id, line.id));
          }
          if (toInsert.length > 0) {
            await tx
              .insert(cartItems)
              .values(
                toInsert.map((line) => ({ ...line, cartId: userCart.id })),
              );
          }

          // the guest cart's lines are deleted with it
          await tx.delete(carts).where(eq(carts.id, guestCart.id));
        }

        // a user can review a product once, so their own review wins
        await tx
          .delete(reviews)
          .where(
            and(
              eq(reviews.userId, anonymousUserId),
              inArray(
                reviews.productId,
                tx
                  .select({ productId: reviews.productId })
                  .from(reviews)
                  .where(eq(reviews.userId, userId)),
              ),
            ),
          );
        await tx
          .update(reviews)
          .set({ userId })
          .where(eq(reviews.userId, anonymousUserId));

        await tx
          .update(addresses)
          .set({ userId })
          .where(eq(addresses.userId, anonymousUserId));
        await tx
          .update(orders)
          .set({ userId })
          .where(eq(orders.userId, anonymousUserId));

        await tx.delete(users).where(eq(users.id, anonymousUserId));
      });
    },
  },
};
