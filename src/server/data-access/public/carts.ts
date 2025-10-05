import { db } from "~/server/db";
import {
  cartItems,
  carts,
  inventoryItems,
  media,
  productOptions,
  productOptionValues,
  productOptionValuesVariants,
  products,
  productVariants,
} from "~/server/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

type NewCart = typeof carts.$inferInsert;
type NewCartItem = typeof cartItems.$inferInsert;

export const _carts = {
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
      const variantValues = db
        .select({
          productVariantId: productOptionValuesVariants.productVariantId,
          json: sql<string[]>`
            jsonb_agg(${productOptionValues.value})
          `.as("values"),
        })
        .from(productOptionValues)
        .leftJoin(
          productOptionValuesVariants,
          eq(
            productOptionValues.id,
            productOptionValuesVariants.productOptionValueId,
          ),
        )
        .leftJoin(
          productOptions,
          eq(productOptionValues.productOptionId, productOptions.id),
        )
        .groupBy(productOptionValuesVariants.productVariantId)
        .as("variant_option_values");

      const cartVariants = db
        .select({
          id: productVariants.id,
          title: products.title,
          price:
            sql`coalesce(${productVariants.overridePrice}, ${products.price})`.as(
              "price",
            ),
          stock: sql`${inventoryItems.quantity}`.as("stock"),
          quantity: sql`${cartItems.quantity}`.as("item_quantity"),
          thumbnail: {
            url: media.url,
          },
          values: variantValues.json,
        })
        .from(productVariants)
        .leftJoin(
          inventoryItems,
          eq(productVariants.id, inventoryItems.variantId),
        )
        .leftJoin(media, eq(productVariants.thumbnailMediaId, media.id))
        .leftJoin(
          variantValues,
          eq(productVariants.id, variantValues.productVariantId),
        )
        .leftJoin(products, eq(productVariants.productId, products.id))
        .leftJoin(cartItems, eq(productVariants.id, cartItems.productVariantId))
        .leftJoin(
          carts,
          and(eq(cartItems.cartId, carts.id), eq(carts.userId, userId)),
        )
        .as("cart_variants");

      type CartItem = {
        id: number;
        quantity: number;
        stock: number;
        title: string;
        price: number;
        thumbnail: { url: string };
        values: string[];
      };

      const cartVariantsJson = db
        .select({
          id: cartVariants.id,
          json: sql<CartItem[]>`
            jsonb_agg(
              jsonb_build_object(
                'id', ${cartVariants.id},
                'quantity', ${cartVariants.quantity},
                'stock', ${cartVariants.stock},
                'title', ${cartVariants.title},
                'price', ${cartVariants.price},
                'thumbnail', jsonb_build_object(
                  'url', ${cartVariants.thumbnail.url}
                ),
                'values', ${cartVariants.values}
              )
            )
          `.as("items"),
        })
        .from(cartVariants)
        .groupBy(cartVariants.id)
        .as("cart_variants_json");

      return db
        .select({
          id: carts.id,
          items: sql<
            CartItem[]
          >`coalesce(${cartVariantsJson.json}, '[]'::jsonb)`.as("items"),
        })
        .from(carts)
        .leftJoin(cartItems, eq(carts.id, cartItems.cartId))
        .leftJoin(
          cartVariantsJson,
          eq(cartItems.productVariantId, cartVariantsJson.id),
        )
        .where(eq(carts.userId, userId))
        .limit(1)
        .then(([res]) => res);
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
          .select({ stock: variants.stock })
          .from(variants)
          .where(eq(variants.id, item.productVariantId))
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
