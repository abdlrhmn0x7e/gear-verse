import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { brands, media } from "~/server/db/schema";

export const _userBrandsRepository = {
  findAll: () => {
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
};
