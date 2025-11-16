import { db } from "~/server/db";
import { and, eq, exists } from "drizzle-orm";
import { brands, categories, media, products } from "~/server/db/schema";

export const _brands = {
  queries: {
    findAll: (filters?: Partial<{ categorySlug: string }>) => {
      if (filters?.categorySlug) {
        return db
          .select({
            id: brands.id,
            name: brands.name,
            slug: brands.slug,
            logo: media.url,
          })
          .from(brands)
          .leftJoin(media, eq(brands.logoMediaId, media.id))
          .leftJoin(products, eq(brands.id, products.brandId))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(eq(categories.slug, filters.categorySlug));
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
