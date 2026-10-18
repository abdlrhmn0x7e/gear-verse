import { db } from "~/server/db";
import { and, asc, eq, inArray } from "drizzle-orm";
import { brands, media, products } from "~/server/db/schema";
import { getCategoryIdsBySlug } from "../common/category-ids";

export const _brands = {
  queries: {
    /** Brands with a live product, optionally only in a category or any of its subcategories. */
    findAll: async (filters?: Partial<{ categorySlug: string }>) => {
      const where = [
        eq(products.published, true),
        eq(products.archived, false),
      ];

      if (filters?.categorySlug) {
        const categoryIds = await getCategoryIdsBySlug(filters.categorySlug);
        if (categoryIds.length === 0) {
          return [];
        }
        where.push(inArray(products.categoryId, categoryIds));
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
        .where(and(...where))
        .orderBy(asc(brands.name));
    },
  },
  mutations: {},
};
