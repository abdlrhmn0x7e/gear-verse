import { cacheTag } from "next/cache";
import { app } from "~/server/application";

export async function getLatestProducts() {
  "use cache";

  cacheTag("recent-products");

  const page = await app.public.products.queries.getPage({ pageSize: 8 });
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

export async function getBrands() {
  "use cache";

  cacheTag("brands");

  return app.public.brands.queries.findAll();
}
