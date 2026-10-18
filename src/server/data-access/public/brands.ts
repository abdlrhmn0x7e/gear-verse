import { db } from "~/server/db";
import { and, asc, eq, inArray } from "drizzle-orm";
import { brands, media, products } from "~/server/db/schema";
import { _categories } from "./categories";

export const _brands = {
  queries: {
    findAll: async (filters?: Partial<{ categorySlug: string }>) => {
      if (filters?.categorySlug) {
        // brands with a live product in the category or any of its subcategories
        const categoryIds =
          await _categories.queries.helpers.getCategoryIdsBySlug(
            filters.categorySlug,
          );
        if (categoryIds.length === 0) {
          return [];
        }

        return db
          .selectDistinct({
            id: brands.id,
            name: brands.name,
            slug: brands.slug,
            logo: media.url,
          })
          .from(brands)
          .innerJoin(products, eq(brands.id, products.brandId))
          .leftJoin(media, eq(brands.logoMediaId, media.id))
          .where(
            and(
              inArray(products.categoryId, categoryIds),
              eq(products.published, true),
              eq(products.archived, false),
            ),
          )
          .orderBy(asc(brands.name));
      }

      return db
        .select({
          id: brands.id,
          name: brands.name,
          slug: brands.slug,
          logo: media.url,
        })
        .from(brands)
        .leftJoin(media, eq(brands.logoMediaId, media.id));
    },
  },
  mutations: {},
};
