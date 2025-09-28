import { gt, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { brands, media } from "../../db/schema";

type NewBrandDto = typeof brands.$inferInsert;
export const _adminBrandsRepo = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
    }: {
      cursor: number | undefined;
      pageSize: number;
    }) => {
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
  },
};
