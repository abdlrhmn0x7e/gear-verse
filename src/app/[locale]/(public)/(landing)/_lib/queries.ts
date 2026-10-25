import { cacheTag } from "next/cache";
import { getLocale } from "next-intl/server";
import { app } from "~/server/application";

export const HERO_PRODUCT_COUNT = 3;
export const MORE_PRODUCT_COUNT = 4;

/** Every pinned product the home row can carry; there are only ever a handful. */
const PINNED_LIMIT = 24;

/**
 * The hero row: every in-stock pinned product in the admin's order, and when fewer than three are pinned, the newest
 * products to fill it to three.
 */
export async function getHeroProducts() {
  "use cache";

  cacheTag("recent-products");

  const page = await app.public.products.queries.getPage({
    pageSize: PINNED_LIMIT,
    sortBy: "trending",
    locale: await getLocale(),
  });
  const pinned = page.data.filter((product) => product.trending);
  if (pinned.length >= HERO_PRODUCT_COUNT) return pinned;

  return page.data.slice(0, HERO_PRODUCT_COUNT);
}

/** Newest in-stock products, enough for one desktop row of four after whatever the hero row already shows. */
export async function getLatestProducts() {
  "use cache";

  cacheTag("recent-products");

  const page = await app.public.products.queries.getPage({
    pageSize: HERO_PRODUCT_COUNT + MORE_PRODUCT_COUNT,
    locale: await getLocale(),
  });
  return page.data;
}

/** Root categories that have at least one product in stock, each with its newest product as the cover. */
export async function getCategoryCovers() {
  "use cache";

  cacheTag("categories-menu", "recent-products");

  const locale = await getLocale();
  const categories = await app.public.categories.queries.findRoots(locale);
  const covers = await Promise.all(
    categories.map(async (category) => {
      const page = await app.public.products.queries.getPage({
        pageSize: 1,
        filters: { categories: [category.slug] },
        locale,
      });
      const product = page.data[0];
      return product ? { category, product } : null;
    }),
  );

  return covers.filter((cover) => cover !== null);
}

/** Brands with a live product, so product edits refresh it too. */
export async function getBrands() {
  "use cache";

  cacheTag("brands", "recent-products");

  return app.public.brands.queries.findAll();
}
