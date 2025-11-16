import { gt, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { brands, media } from "../../db/schema";
import type { Pagination } from "../common/types";

type NewBrandDto = typeof brands.$inferInsert;
export const _brands = {
  queries: {
    getPage: async ({ cursor, pageSize }: Pagination) => {
      return db
        .select({ id: brands.id, name: brands.name, logo: { url: media.url } })
        .from(brands)
        .where(gt(brands.id, cursor ?? 0))
        .leftJoin(media, eq(brands.logoMediaId, media.id))
        .limit(pageSize + 1)
        .orderBy(desc(brands.id));
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

    delete: (brandId: number) => {
      return db
        .delete(brands)
        .where(eq(brands.id, brandId))
        .returning({ id: brands.id })
        .then(([brand]) => brand);
    },
  },
};
