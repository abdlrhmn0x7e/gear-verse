import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  lt,
  sql,
} from "drizzle-orm";
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

type InventoryItemRow = {
  id: number;
  productVariantId: number | null;
  quantity: number;
  values: string[];
  thumbnailUrl: string | null;
};
/** A product and its stock rows: one without variants, one per variant. */
type InventoryProductRow = {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  items: InventoryItemRow[];
};

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
      const itemMedia = alias(media, "item_media");
      const visibleItemsCTE = db.$with("visible_items").as(
        db
          .with(variantsCTE)
          .select({
            id: inventoryItems.id,
            productId: inventoryItems.productId,
            productVariantId: inventoryItems.productVariantId,
            quantity: inventoryItems.quantity,
            thumbnailUrl: sql<
              string | null
            >`coalesce(${itemMedia.url}, ${variantsCTE.thumbnailUrl})`.as(
              "thumbnail_url",
            ),
            values: sql<
              string[]
            >`coalesce(${variantsCTE.values}, '[]'::jsonb)`.as("values"),
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
          .leftJoin(itemMedia, eq(products.thumbnailMediaId, itemMedia.id))
          .where(
            sql`coalesce(${products.archived}, ${variantsCTE.variantArchived}, false) = false`,
          ),
      );

      // Paged by product, and only products with a visible item, so every
      // product on a page has rows and the pageSize + 1 overflow check holds.
      const whereClause = [];
      if (cursor) {
        whereClause.push(lt(visibleItemsCTE.productId, cursor));
      }
      if (filters?.inventorySearch) {
        whereClause.push(ilike(products.title, `%${filters.inventorySearch}%`));
      }

      const productMedia = alias(media, "product_media");
      const pageProducts = await db
        .with(visibleItemsCTE)
        .selectDistinct({
          id: visibleItemsCTE.productId,
          title: products.title,
          thumbnailUrl: productMedia.url,
        })
        .from(visibleItemsCTE)
        .innerJoin(products, eq(visibleItemsCTE.productId, products.id))
        .leftJoin(productMedia, eq(products.thumbnailMediaId, productMedia.id))
        .where(and(...whereClause))
        .orderBy(desc(visibleItemsCTE.productId))
        .limit(pageSize + 1);

      if (pageProducts.length === 0) {
        return [];
      }

      const items = await db
        .with(visibleItemsCTE)
        .select({
          id: visibleItemsCTE.id,
          productId: visibleItemsCTE.productId,
          productVariantId: visibleItemsCTE.productVariantId,
          quantity: visibleItemsCTE.quantity,
          values: visibleItemsCTE.values,
          thumbnailUrl: visibleItemsCTE.thumbnailUrl,
        })
        .from(visibleItemsCTE)
        .where(
          inArray(
            visibleItemsCTE.productId,
            pageProducts.map((product) => product.id),
          ),
        )
        .orderBy(desc(visibleItemsCTE.productId), asc(visibleItemsCTE.id));

      const byProduct = new Map<number, InventoryProductRow>(
        pageProducts.map((product) => [product.id, { ...product, items: [] }]),
      );
      for (const { productId, ...item } of items) {
        byProduct.get(productId)?.items.push(item);
      }

      return [...byProduct.values()];
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
    ensureProductItem(productId: number, quantity: number, tx?: Tx) {
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
          .values({ productId, quantity })
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
