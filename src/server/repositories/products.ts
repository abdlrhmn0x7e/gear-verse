import { eq, gt, ilike, and } from "drizzle-orm";
import { db } from "../db";
import { categories, media, products } from "../db/schema";

type NewProduct = typeof products.$inferInsert;
export const _productsRepository = {
  queries: {
    findAll() {
      return db
        .select({
          id: products.id,
          title: products.title,
          thumbnailUrl: media.url,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .leftJoin(media, eq(products.thumbnailMediaId, media.id));
    },

    getPage: ({
      cursor,
      pageSize,
      title,
    }: {
      cursor: number | undefined;
      pageSize: number;
      title?: string | null;
    }) => {
      return db
        .select({
          id: products.id,
          title: products.title,
          thumbnailUrl: media.url,
          category: categories.name,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          and(
            gt(products.id, cursor ?? 0),
            ilike(products.title, `%${title ?? ""}%`),
          ),
        )
        .limit(pageSize + 1)
        .orderBy(products.id);
    },
  },
  mutations: {
    create: (product: NewProduct) => {
      return db
        .insert(products)
        .values(product)
        .returning({ id: products.id })
        .then(([result]) => result);
    },
  },
};
