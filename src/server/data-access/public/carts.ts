import { db } from "~/server/db";
import {
  cartItems,
  carts,
  inventoryItems,
  media,
  productOptionValues,
  productOptionValuesVariants,
  products,
  productVariants,
} from "~/server/db/schema";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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
        .then(([res]) => res);
    },

    find: async (userId: number) => {
      const variantValues = db.$with("variant_values").as(
        db
          .select({
            id: sql<number>`${productVariants.id}`.as("variant_values_id"),
            values: sql<string[]>`
            jsonb_agg(${productOptionValues.value})
          `.as("values"),
          })
          .from(productVariants)
          .leftJoin(
            productOptionValuesVariants,
            eq(
              productVariants.id,
              productOptionValuesVariants.productVariantId,
            ),
          )
          .leftJoin(
            productOptionValues,
            eq(
              productOptionValuesVariants.productOptionValueId,
              productOptionValues.id,
            ),
          )
          .groupBy(productVariants.id),
      );

      const variantsInventory = alias(inventoryItems, "variants_inventory");
      const productsInventory = alias(inventoryItems, "products_inventory");
      const productThumbnail = alias(media, "product_thumbnail");
      const variantThumbnail = alias(media, "variant_thumbnail");

      const items = db
        .with(variantValues)
        .select({
          id: sql<number>`${cartItems.id}`.as("cart_item_id"),
          cartId: sql<number>`${cartItems.cartId}`.as("cart_item_cart_id"),

          quantity: cartItems.quantity,
          productId: sql<number>`${products.id}`.as("cart_item_product_id"),
          title: products.title,

          productVariantId: sql<number>`${productVariants.id}`.as(
            "cart_item_product_variant_id",
          ),
          values: variantValues.values,

          price:
            sql`coalesce(${productVariants.overridePrice}, ${products.price})`.as(
              "price",
            ),
          thumbnailUrl:
            sql`coalesce(${variantThumbnail.url}, ${productThumbnail.url})`.as(
              "thumbnailUrl",
            ),

          stock:
            sql`coalesce(${variantsInventory.quantity}, ${productsInventory.quantity})`.as(
              "stock",
            ),
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(
          productVariants,
          and(
            eq(products.id, productVariants.productId),
            eq(cartItems.productVariantId, productVariants.id),
          ),
        )
        .leftJoin(variantValues, eq(productVariants.id, variantValues.id))

        .leftJoin(
          variantsInventory,
          and(
            eq(variantsInventory.productId, products.id),
            eq(variantsInventory.productVariantId, productVariants.id),
          ),
        )
        .leftJoin(
          productsInventory,
          and(
            eq(productsInventory.productId, products.id),
            isNull(productsInventory.productVariantId),
          ),
        )

        .leftJoin(
          productThumbnail,
          eq(products.thumbnailMediaId, productThumbnail.id),
        )

        .leftJoin(
          variantThumbnail,
          eq(productVariants.thumbnailMediaId, variantThumbnail.id),
        )
        .orderBy(desc(cartItems.id))
        .as("items");

      type CartItem = {
        id: number;

        productId: number;
        title: string;

        productVariantId: number | null;

        quantity: number;
        stock: number;

        price: number;
        thumbnailUrl: string;

        values: string[] | null;
      };

      const itemsJson = db
        .select({
          cartId: items.cartId,
          json: sql<CartItem[]>`
            jsonb_agg(
              jsonb_build_object(
                'id', ${items.id},
                'quantity', ${items.quantity},
                'productId', ${items.productId},
                'productVariantId', ${items.productVariantId},
                'stock', ${items.stock},
                'title', ${items.title},
                'price', ${items.price},
                'thumbnailUrl', ${items.thumbnailUrl},
                'values', ${items.values}
              )
            )
        `.as("json"),
        })
        .from(items)
        .groupBy(items.cartId)
        .as("items_json");

      return db
        .select({
          id: carts.id,
          items: sql<CartItem[]>`coalesce(${itemsJson.json}, '[]'::jsonb)`.as(
            "items",
          ),
        })
        .from(carts)
        .where(eq(carts.userId, userId))
        .leftJoin(itemsJson, eq(carts.id, itemsJson.cartId))
        .then(([res]) => res ?? null);
    },
  },

  mutations: {
    create: async (cart: NewCart) => {
      return db
        .insert(carts)
        .values(cart)
        .onConflictDoNothing({
          target: [carts.userId],
        })
        .returning({ id: carts.id })
        .then(([res]) => res);
    },

    addItem: async (item: NewCartItem) => {
      return db.transaction(async (tx) => {
        let stock = 0;

        if (item.productVariantId) {
          const [variant] = await tx
            .select({ stock: inventoryItems.quantity })
            .from(inventoryItems)
            .where(
              and(
                eq(inventoryItems.productId, item.productId),
                eq(inventoryItems.productVariantId, item.productVariantId),
              ),
            )
            .limit(1);

          stock = variant?.stock ?? 0;
        } else {
          const [product] = await tx
            .select({ stock: inventoryItems.quantity })
            .from(inventoryItems)
            .where(
              and(
                eq(inventoryItems.productId, item.productId),
                isNull(inventoryItems.productVariantId),
              ),
            )
            .limit(1);

          stock = product?.stock ?? 0;
        }

        if (stock === 0) {
          throw new Error("Product out of stock");
        }

        const [updated] = await tx
          .insert(cartItems)
          .values(item)
          .onConflictDoUpdate({
            target: [cartItems.cartId, cartItems.productId],
            targetWhere: isNull(cartItems.productVariantId),

            set: {
              quantity: sql`${cartItems.quantity} + 1`,
            },
          })
          .returning({ id: cartItems.id, quantity: cartItems.quantity });

        if (stock < (updated?.quantity ?? 1)) {
          throw new Error("Product out of stock");
        }

        return updated;
      });
    },

    removeItem: async (
      cartId: number,
      productId: number,
      productVariantId: number | null,
    ) => {
      return db.transaction(async (tx) => {
        const whereClause = [
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId),
        ];
        if (productVariantId) {
          whereClause.push(eq(cartItems.productVariantId, productVariantId));
        }

        const [updated] = await tx
          .update(cartItems)
          .set({ quantity: sql`${cartItems.quantity} - 1` })
          .where(and(...whereClause, gt(cartItems.quantity, 1)))
          .returning({ id: cartItems.id });

        if (updated) {
          return;
        }

        return tx.delete(cartItems).where(and(...whereClause));
      });
    },
  },
};
