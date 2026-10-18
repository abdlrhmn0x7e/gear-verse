import { and, desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { products } from "~/server/db/schema";
import { _categories } from "./categories";

export const _sitemap = {
  queries: {
    /**
     * Every page worth indexing: published products (in stock or not, their
     * page still sells them), and the categories that list at least one
     * product that can be bought.
     */
    findEntries: async () => {
      const [productRows, categoryRows] = await Promise.all([
        db
          .select({ slug: products.slug, updatedAt: products.updatedAt })
          .from(products)
          .where(
            and(eq(products.published, true), eq(products.archived, false)),
          )
          .orderBy(desc(products.updatedAt)),
        _categories.queries.findWithLiveProducts(),
      ]);

      return {
        products: productRows,
        // plain rows: the driver's result list carries extra fields
        categories: Array.from(categoryRows, ({ slug, updatedAt }) => ({
          slug,
          updatedAt: new Date(updatedAt),
        })),
      };
    },
  },
};
