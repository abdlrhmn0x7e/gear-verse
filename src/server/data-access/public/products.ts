import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/server/db";
import {
  brands,
  categories,
  inventoryItems,
  media,
  products,
  productsMedia,
  seo,
} from "~/server/db/schema";
import { fullVariantsCTE, variantsCTE } from "../common/cte";
import type { Pagination } from "../common/types";

export const _products = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
      filters,
      sortBy,
    }: Pagination<
      {
        title: string;
        brands: string[];
        categories: string[];
        price: {
          min: number;
          max: number;
        };
      },
      "price-asc" | "price-desc" | "newest" | "oldest"
    >) => {
      const whereClause = [
        gt(products.id, cursor ?? 0),
        eq(products.published, true),
      ];
      if (filters?.title) {
        whereClause.push(ilike(products.title, `%${filters.title}%`));
      }
      if (filters?.brands) {
        whereClause.push(inArray(brands.slug, filters.brands));
      }
      if (filters?.categories) {
        const categoriesIds = new Set<number>();
        await Promise.all(
          filters.categories.map(async (categorySlug) => {
            const ids =
              await _products.queries.helpers.getCategoryIdsBySlug(
                categorySlug,
              );
            ids.forEach((id) => categoriesIds.add(id));
          }),
        );

        whereClause.push(inArray(categories.id, Array.from(categoriesIds)));
      }

      if (filters?.price?.min) {
        whereClause.push(gte(products.price, filters.price.min));
      }
      if (filters?.price?.max) {
        whereClause.push(lte(products.price, filters.price.max));
      }

      // Default order by is newest (desc)
      let orderBy = desc(products.id);
      switch (sortBy) {
        case "price-asc":
          orderBy = asc(products.price);
          break;
        case "price-desc":
          orderBy = desc(products.price);
          break;
        case "newest":
          orderBy = desc(products.id);
          break;
        case "oldest":
          orderBy = asc(products.id);
          break;
      }

      const brandsMedia = alias(media, "brands_media");
      return db
        .with(variantsCTE)
        .select({
          id: products.id,
          slug: products.slug,
          title: products.title,
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          summary: products.summary,
          thumbnailUrl: media.url,
          stock: inventoryItems.quantity,
          category: {
            name: categories.name,
            slug: categories.slug,
          },
          brand: {
            name: brands.name,
            logoUrl: brandsMedia.url,
          },
          variants: variantsCTE.json,
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoin(
          inventoryItems,
          and(
            eq(inventoryItems.productId, products.id),
            isNull(inventoryItems.productVariantId),
          ),
        )
        .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))
        .leftJoin(variantsCTE, eq(variantsCTE.productId, products.id))
        .where(
          and(
            sql`(
                coalesce(${inventoryItems.quantity}, 0) > 0
                OR
                ${variantsCTE.json} @@ '$.stock > 0'
              )`,
            ...whereClause,
          ),
        )
        .limit(pageSize + 1)
        .orderBy(orderBy);
    },

    findBySlug: async (slug: string) => {
      const brandsMedia = alias(media, "brands_media");

      const productMediaSubQuery = db
        .select({
          productId: productsMedia.productId,
          json: sql<string[]>`jsonb_agg(${media.url})`.as("media_json"),
        })
        .from(productsMedia)
        .leftJoin(media, eq(productsMedia.mediaId, media.id))
        .groupBy(productsMedia.productId)
        .as("product_media");

      return db
        .with(fullVariantsCTE)
        .select({
          id: products.id,
          title: products.title,
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          summary: products.summary,
          description: products.description,
          published: products.published,
          categoryId: products.categoryId,
          stock: inventoryItems.quantity,

          brand: {
            name: brands.name,
            logoUrl: brandsMedia.url,
          },

          profit: products.profit,
          margin: products.margin,
          variants: fullVariantsCTE.json,
          media: productMediaSubQuery.json,
          seo: {
            pageTitle: seo.pageTitle,
            urlHandler: seo.urlHandler,
            metaDescription: seo.metaDescription,
          },
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))

        .leftJoin(fullVariantsCTE, eq(fullVariantsCTE.productId, products.id))
        .leftJoin(
          productMediaSubQuery,
          eq(productMediaSubQuery.productId, products.id),
        )

        .leftJoin(inventoryItems, eq(inventoryItems.productId, products.id))
        .leftJoin(seo, eq(seo.urlHandler, products.slug))

        .where(eq(products.slug, slug))
        .limit(1)
        .then(([product]) => product);
    },

    findMetadata: async (slug: string) => {
      return db
        .select({
          title: products.title,
          summary: products.summary,
          thumbnailUrl: sql<string>`${media.url}`,
          seo: {
            pageTitle: seo.pageTitle,
            metaDescription: seo.metaDescription,
          },
        })
        .from(products)
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoin(seo, eq(seo.urlHandler, products.slug))
        .where(eq(products.slug, slug))
        .limit(1)
        .then(([product]) => product);
    },

    findAllSlugs: async () => {
      return db
        .select({
          slug: products.slug,
        })
        .from(products)
        .where(eq(products.published, true));
    },

    helpers: {
      async getCategoryIdsBySlug(categorySlug: string) {
        const childrenCategoriesIdsQuery = sql<{ id: string }[]>`
              WITH RECURSIVE all_children_categories AS (
                SELECT categories.id, categories.slug
                FROM categories
                WHERE slug = ${categorySlug}

                UNION ALL

                SELECT categories.id, categories.slug
                FROM categories
                INNER JOIN all_children_categories
                  ON all_children_categories.id = categories.parent_id
              )

              SELECT id FROM all_children_categories
            `;

        return db
          .execute<{ id: number }>(childrenCategoriesIdsQuery)
          .then((result) => result.map((row) => row.id));
      },
    },
  },
};
