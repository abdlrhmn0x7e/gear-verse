import type { MetadataRoute } from "next";
import { findSitemapEntries } from "~/lib/seo/sitemap-entries";
import { absoluteUrl } from "~/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await findSitemapEntries();
  // the home page and the store list the newest products
  const newest = products[0]?.updatedAt;

  return [
    { url: absoluteUrl("/"), lastModified: newest },
    { url: absoluteUrl("/products"), lastModified: newest },
    { url: absoluteUrl("/returns") },
    ...categories.map((category) => ({
      url: absoluteUrl(`/categories/${category.slug}`),
      lastModified: category.updatedAt,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt,
    })),
  ];
}
