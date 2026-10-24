import type { MetadataRoute } from "next";
import { routing } from "~/i18n/routing";
import { languageAlternates, localizedPath } from "~/lib/seo/metadata";
import { findSitemapEntries } from "~/lib/seo/sitemap-entries";
import { absoluteUrl } from "~/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await findSitemapEntries();
  // the home page and the store list the newest products
  const newest = products[0]?.updatedAt;

  const pages: { path: string; lastModified?: Date }[] = [
    { path: "/", lastModified: newest },
    { path: "/products", lastModified: newest },
    { path: "/returns" },
    ...categories.map((category) => ({
      path: `/categories/${category.slug}`,
      lastModified: category.updatedAt,
    })),
    ...products.map((product) => ({
      path: `/products/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];

  // every page once per locale, each entry naming all of its language versions
  return pages.flatMap(({ path, lastModified }) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([language, href]) => [
        language,
        absoluteUrl(href),
      ]),
    );
    return routing.locales.map((locale) => ({
      url: absoluteUrl(localizedPath(path, locale)),
      lastModified,
      alternates: { languages },
    }));
  });
}
