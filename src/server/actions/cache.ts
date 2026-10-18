import { revalidateTag } from "next/cache";
import "server-only";

/**
 * Server side only on purpose: this used to be a server action, which let
 * anyone clear any cache tag from the browser.
 *
 * Writes come in through tRPC, which runs in a route handler where
 * `updateTag` can't be used. `expire: 0` is the route handler equivalent:
 * the next request waits for fresh data instead of being served the stale
 * entry, so an admin sees their edit (and shoppers see the new stock and
 * price) right away.
 */
export async function invalidateCache(key: string) {
  revalidateTag(key, { expire: 0 });
}

/**
 * Invalidates everything that shows the category tree: the menus and chips,
 * each category's sub-categories and filters, the home page covers, the
 * category and product breadcrumbs, and the sitemap. They all read the whole
 * tree, so moving a category refreshes its old and new parents alike.
 */
export async function invalidateCategories() {
  await Promise.all([
    invalidateCache("categories-menu"),
    invalidateCache("category-filters"),
    invalidateCache("sitemap"),
  ]);
}

/**
 * Invalidates the product pages and the cached product listings, which only
 * show products that are in stock. Call it after the write is done.
 *
 * "sitemap" covers which products and categories are live: publishing,
 * archiving and stock changes all move a page in or out of it.
 */
export async function invalidateProducts(productIds: number[]) {
  await Promise.all([
    ...Array.from(new Set(productIds), (id) =>
      invalidateCache(`products:${id}`),
    ),
    invalidateCache("recent-products"),
    invalidateCache("products-menu"),
    invalidateCache("sitemap"),
  ]);
}
