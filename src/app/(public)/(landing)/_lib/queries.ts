import { cacheTag } from "next/cache";
import { app } from "~/server/application";

export const HERO_PRODUCT_COUNT = 3;
export const MORE_PRODUCT_COUNT = 4;

/** The hero row: in-stock pinned products in the admin's order, then the newest to fill it. */
export async function getHeroProducts() {
  "use cache";

  cacheTag("recent-products");

  const page = await app.public.products.queries.getPage({
    pageSize: HERO_PRODUCT_COUNT,
    sortBy: "trending",
  });
  return page.data;
}

/** Newest in-stock products, enough for one desktop row of four after whatever the hero row already shows. */
export async function getLatestProducts() {
  "use cache";

  cacheTag("recent-products");

  const page = await app.public.products.queries.getPage({
    pageSize: HERO_PRODUCT_COUNT + MORE_PRODUCT_COUNT,
  });
  return page.data;
}

/** Root categories that have at least one product in stock, each with its newest product as the cover. */
export async function getCategoryCovers() {
  "use cache";

  cacheTag("categories-menu", "recent-products");

  const categories = await app.public.categories.queries.findRoots();
  const covers = await Promise.all(
    categories.map(async (category) => {
      const page = await app.public.products.queries.getPage({
        pageSize: 1,
        filters: { categories: [category.slug] },
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
