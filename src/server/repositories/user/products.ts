import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { media, products, productVariants } from "~/server/db/schema";

export const _userProductsRepository = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
    }: {
      cursor: number | undefined;
      pageSize: number;
    }) => {
      const whereClause = [
        gt(products.id, cursor ?? 0),
        eq(products.published, true),
      ];

      const cheapestVariant = db
        .select({ price: productVariants.price })
        .from(productVariants)
        .where(eq(productVariants.productId, products.id))
        .orderBy(asc(productVariants.price))
        .limit(1)
        .as("cheapest_variant");

      return db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: cheapestVariant.price,
          summary: products.summary,
          thumbnail: media.url,
        })
        .from(products)
        .where(and(...whereClause))
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoinLateral(cheapestVariant, sql`true`)
        .limit(pageSize + 1)
        .orderBy(desc(products.id));
    },
  },
};
