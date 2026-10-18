import { and, desc, eq, ilike, isNull, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, type Tx } from "~/server/db";
import { withTx } from "../common/transaction";
import {
  inventoryItems,
  media,
  productOptions,
  productOptionValues,
  productOptionValuesVariants,
  products,
  productVariants,
} from "~/server/db/schema";
import { orderedOptionValues } from "../common/cte";
import type { Pagination } from "../common/types";

type NewInventoryItem = typeof inventoryItems.$inferInsert;
type UpdateInventoryItem = Partial<NewInventoryItem> & { id: number };

export const _inventoryItems = {
  queries: {
    getPage: async ({
      pageSize,
      cursor,
      filters,
    }: Pagination<{ inventorySearch: string | null }>) => {
      const variantValuesCTE = db.$with("variant_values").as(
        db
          .select({
            id: productVariants.id,
            values: orderedOptionValues.as("values"),
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
          .leftJoin(
            productOptions,
            eq(productOptionValues.productOptionId, productOptions.id),
          )
          .groupBy(productVariants.id),
      );

      const variantMedia = alias(media, "variant_media");
      const variantsCTE = db.$with("variants").as(
        db
          .with(variantValuesCTE)
          .select({
            id: productVariants.id,
            productId: productVariants.productId,
            title: products.title,
            thumbnailUrl: variantMedia.url,
            values: variantValuesCTE.values,
            variantArchived:
              sql<boolean>`(${productVariants.archived} OR ${products.archived})`.as(
                "variant_archived",
              ),
          })
          .from(productVariants)
          .leftJoin(products, eq(productVariants.productId, products.id))
          .leftJoin(
            variantMedia,
            eq(productVariants.thumbnailMediaId, variantMedia.id),
          )
          .leftJoin(
            variantValuesCTE,
            eq(productVariants.id, variantValuesCTE.id),
          ),
      );

      // hide inventory of archived products and archived variants
      // (product-level rows join `products`, variant rows join the variants CTE)
      const whereClause = [
        sql`coalesce(${products.archived}, ${variantsCTE.variantArchived}, false) = false`,
      ];

      if (cursor) {
        whereClause.push(lt(inventoryItems.id, cursor));
      }

      if (filters?.inventorySearch) {
        whereClause.push(
          ilike(
            sql<string>`coalesce(${products.title}, ${variantsCTE.title})`,
            `%${filters.inventorySearch}%`,
          ),
        );
      }

      const productMedia = alias(media, "product_media");
      return db
        .with(variantsCTE)
        .select({
          id: inventoryItems.id,
          productId: inventoryItems.productId,
          productVariantId: inventoryItems.productVariantId,
          title:
            sql<string>`coalesce(${products.title}, ${variantsCTE.title})`.as(
              "title",
            ),
          quantity: inventoryItems.quantity,
          thumbnailUrl:
            sql<string>`coalesce(${productMedia.url}, ${variantsCTE.thumbnailUrl})`.as(
              "thumbnailUrl",
            ),
          values: sql<
            string[]
          >`coalesce(${variantsCTE.values}, '[]'::jsonb)`.as("variants"),
        })
        .from(inventoryItems)
        .leftJoin(
          products,
          and(
            eq(inventoryItems.productId, products.id),
            isNull(inventoryItems.productVariantId),
          ),
        )
        .leftJoin(
          variantsCTE,
          and(
            eq(inventoryItems.productId, variantsCTE.productId),
            eq(inventoryItems.productVariantId, variantsCTE.id),
          ),
        )
        .leftJoin(productMedia, eq(products.thumbnailMediaId, productMedia.id))
        .where(and(...whereClause))
        .limit(pageSize + 1)
        .orderBy(desc(inventoryItems.id));
    },
  },

  mutations: {
    updateMany(input: UpdateInventoryItem[]) {
      return db.transaction(async (tx) => {
        const updatedItems: { id: number; productId: number }[] = [];

        for (const item of input) {
          const { id, ...updateData } = item;
          const [updatedItem] = await tx
            .update(inventoryItems)
            .set(updateData)
            .where(eq(inventoryItems.id, id))
            .returning({
              id: inventoryItems.id,
              productId: inventoryItems.productId,
            });

          if (!updatedItem) {
            throw new Error(`Inventory item with ID ${id} not found.`);
          }

          updatedItems.push(updatedItem);
        }

        return updatedItems;
      });
    },

    /**
     * A product without variants keeps its stock on a product level row
     * (no variant id). Creates that row if it's missing, e.g. after every
     * variant of the product was removed.
     */
    ensureProductItem(productId: number, tx?: Tx) {
      return withTx(tx, async (tx) => {
        const [existing] = await tx
          .select({ id: inventoryItems.id })
          .from(inventoryItems)
          .where(
            and(
              eq(inventoryItems.productId, productId),
              isNull(inventoryItems.productVariantId),
            ),
          )
          .limit(1);

        if (existing) {
          return existing;
        }

        return tx
          .insert(inventoryItems)
          .values({ productId, quantity: 0 })
          .returning({ id: inventoryItems.id })
          .then(([res]) => res);
      });
    },

    delete(productId: number, variantId?: number, tx?: Tx) {
      if (!variantId) {
        return (tx ?? db)
          .delete(inventoryItems)
          .where(
            and(
              eq(inventoryItems.productId, productId),
              isNull(inventoryItems.productVariantId),
            ),
          );
      }

      return (tx ?? db)
        .delete(inventoryItems)
        .where(
          and(
            eq(inventoryItems.productId, productId),
            eq(inventoryItems.productVariantId, variantId),
          ),
        );
    },
  },
};
