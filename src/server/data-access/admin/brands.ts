import { count, lt, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { brands, media, products } from "../../db/schema";
import type { Pagination } from "../common/types";

type NewBrandDto = typeof brands.$inferInsert;
type UpdateBrandDto = Partial<Pick<NewBrandDto, "name" | "logoMediaId">>;
export const _brands = {
  queries: {
    getPage: async ({ cursor, pageSize }: Pagination) => {
      return db
        .select({
          id: brands.id,
          name: brands.name,
          slug: brands.slug,
          logo: { id: media.id, url: media.url },
          productCount: count(products.id),
        })
        .from(brands)
        .where(cursor !== undefined ? lt(brands.id, cursor) : undefined)
        .leftJoin(media, eq(brands.logoMediaId, media.id))
        .leftJoin(products, eq(products.brandId, brands.id))
        .groupBy(brands.id, media.id)
        .limit(pageSize + 1)
        .orderBy(desc(brands.id));
    },

    countProducts: async (brandId: number) => {
      return db.$count(products, eq(products.brandId, brandId));
    },
  },

  mutations: {
    create: (input: NewBrandDto) => {
      return db
        .insert(brands)
        .values(input)
        .returning({ id: brands.id })
        .then(([brand]) => brand);
    },

    update: (id: number, input: UpdateBrandDto) => {
      return db
        .update(brands)
        .set(input)
        .where(eq(brands.id, id))
        .returning({ id: brands.id })
        .then(([brand]) => brand);
    },

    delete: (brandId: number) => {
      return db
        .delete(brands)
        .where(eq(brands.id, brandId))
        .returning({ id: brands.id })
        .then(([brand]) => brand);
    },
  },
};
