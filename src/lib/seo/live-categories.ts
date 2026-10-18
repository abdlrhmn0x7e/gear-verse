import { cacheTag } from "next/cache";
import { app } from "~/server/application";

/**
 * Categories with at least one published, in-stock product. "sitemap" is
 * invalidated whenever a product or category changes in a way that can move
 * one in or out.
 */
export async function findLiveCategories() {
  "use cache";

  cacheTag("sitemap");

  const categories = await app.public.categories.queries.findWithLiveProducts();
  // plain rows: the driver's result list carries extra fields
  return Array.from(categories, ({ id, slug, updatedAt }) => ({
    id,
    slug,
    updatedAt,
  }));
}
