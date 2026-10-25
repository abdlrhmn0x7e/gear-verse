import {
  and,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  max,
  min,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { JSONContent } from "@tiptap/react";
import { db } from "~/server/db";
import {
  brands,
  categories,
  inventoryItems,
  media,
  products,
  productsMedia,
  reviews,
  seo,
} from "~/server/db/schema";
import { getCategoryIdsBySlug } from "../common/category-ids";
import { fullVariantsCTE, variantsCTE, type FullVariant } from "../common/cte";
import { inStockSql } from "../common/purchasable";
import type { Pagination } from "../common/types";
import {
  getProductsOrdering,
  type ProductsSortBy,
} from "../common/products-ordering";
import type { Locale } from "~/i18n/routing";
import { englishFallback, localized } from "../common/localized";

/** A product's summary in `locale`; titles, brands and options stay as entered. */
function localizedSummary(locale: Locale) {
  return localized<string>(products.summary, products.summaryAr, locale);
}

export const _products = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
      filters,
      sortBy,
      locale,
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
      ProductsSortBy
    > & { locale: Locale }) => {
      const { orderBy, cursorWhere } = getProductsOrdering(sortBy, cursor);
      const whereClause = [
        cursorWhere,
        eq(products.published, true),
        eq(products.archived, false),
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
            const ids = await getCategoryIdsBySlug(categorySlug);
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

      const brandsMedia = alias(media, "brands_media");
      return db
        .with(variantsCTE)
        .select({
          id: products.id,
          slug: products.slug,
          title: products.title,
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          summary: localizedSummary(locale),
          trending: sql<boolean>`${products.pinnedPosition} is not null`,
          thumbnailUrl: media.url,
          stock: inventoryItems.quantity,
          category: {
            name: localized<string>(
              categories.name,
              categories.name_ar,
              locale,
            ),
            slug: categories.slug,
          },
          fallback: {
            summary: englishFallback(
              products.summary,
              products.summaryAr,
              locale,
            ),
            category: englishFallback(
              categories.name,
              categories.name_ar,
              locale,
            ),
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
                ${products.allowBackorder}
                OR
                coalesce(${inventoryItems.quantity}, 0) > 0
                OR
                ${variantsCTE.json} @@ '$.stock > 0'
              )`,
            ...whereClause,
          ),
        )
        .limit(pageSize + 1)
        .orderBy(...orderBy);
    },

    findBySlug: async (
      slug: string,
      {
        // the admin's product summary also shows drafts
        includeDrafts = false,
        locale,
      }: { includeDrafts?: boolean; locale: Locale },
    ) => {
      const brandsMedia = alias(media, "brands_media");

      const productMediaSubQuery = db
        .select({
          productId: productsMedia.productId,
          json: sql<string[]>`
            jsonb_agg(${media.url} order by ${productsMedia.order}, ${productsMedia.id})
          `.as("media_json"),
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
          summary: localizedSummary(locale),
          description: localized<JSONContent>(
            products.description,
            products.descriptionAr,
            locale,
          ),
          fallback: {
            summary: englishFallback(
              products.summary,
              products.summaryAr,
              locale,
            ),
            description: englishFallback(
              products.description,
              products.descriptionAr,
              locale,
            ),
          },
          published: products.published,
          condition: products.condition,
          categoryId: products.categoryId,
          allowBackorder: products.allowBackorder,
          stock: inventoryItems.quantity,

          brand: {
            name: brands.name,
            logoUrl: brandsMedia.url,
          },

          variants: sql<
            FullVariant[]
          >`coalesce(${fullVariantsCTE.json}, '[]'::jsonb)`,
          thumbnailUrl: sql<string>`${media.url}`,
          media: sql<
            string[]
          >`coalesce(${productMediaSubQuery.json}, '[]'::jsonb)`,
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
        .leftJoin(media, eq(media.id, products.thumbnailMediaId))
        .leftJoin(
          inventoryItems,
          and(
            eq(inventoryItems.productId, products.id),
            isNull(inventoryItems.productVariantId),
          ),
        )
        .leftJoin(seo, eq(seo.urlHandler, products.slug))

        .where(
          and(
            eq(products.slug, slug),
            includeDrafts ? undefined : eq(products.published, true),
            eq(products.archived, false),
          ),
        )
        .limit(1)
        .then(([product]) => product);
    },

    /**
     * Everything the product page's metadata and structured data need, without
     * the description or the variants.
     */
    findMetadata: async (slug: string, locale: Locale) => {
      const productMedia = db
        .select({
          productId: productsMedia.productId,
          urls: sql<string[]>`
            jsonb_agg(${media.url} order by ${productsMedia.order}, ${productsMedia.id})
          `.as("media_urls"),
        })
        .from(productsMedia)
        .innerJoin(media, eq(productsMedia.mediaId, media.id))
        .groupBy(productsMedia.productId)
        .as("product_media");

      return db
        .select({
          id: products.id,
          slug: products.slug,
          title: products.title,
          summary: localizedSummary(locale),
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          condition: products.condition,
          categoryId: products.categoryId,
          updatedAt: products.updatedAt,
          brand: {
            name: brands.name,
          },
          thumbnailUrl: sql<string>`${media.url}`,
          media: sql<string[]>`coalesce(${productMedia.urls}, '[]'::jsonb)`,
          inStock: inStockSql(products.id),
          allowBackorder: products.allowBackorder,
          reviews: {
            count: sql<number>`(
              select count(*)::int from ${reviews}
              where ${reviews.productId} = ${products.id}
            )`,
            averageRating: sql<number | null>`(
              select avg(${reviews.rating})::float from ${reviews}
              where ${reviews.productId} = ${products.id}
            )`,
          },
          seo: {
            pageTitle: seo.pageTitle,
            metaDescription: seo.metaDescription,
          },
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoin(productMedia, eq(productMedia.productId, products.id))
        .leftJoin(seo, eq(seo.urlHandler, products.slug))
        .where(
          and(
            eq(products.slug, slug),
            eq(products.published, true),
            eq(products.archived, false),
          ),
        )
        .limit(1)
        .then(([product]) => product);
    },

    findAllSlugs: async () => {
      return db
        .select({
          slug: products.slug,
        })
        .from(products)
        .where(and(eq(products.published, true), eq(products.archived, false)));
    },

    /** The cheapest and dearest live product, optionally in a category or any of its subcategories; null when none. */
    getPriceRange: async (filters?: Partial<{ categorySlug: string }>) => {
      const where = [
        eq(products.published, true),
        eq(products.archived, false),
      ];

      if (filters?.categorySlug) {
        const categoryIds = await getCategoryIdsBySlug(filters.categorySlug);
        if (categoryIds.length === 0) return null;
        where.push(inArray(products.categoryId, categoryIds));
      }

      const [range] = await db
        .select({ min: min(products.price), max: max(products.price) })
        .from(products)
        .where(and(...where));

      return range?.min != null && range.max != null
        ? { min: range.min, max: range.max }
        : null;
    },
  },
};
