import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "~/i18n/navigation";
import { routing, type Locale } from "~/i18n/routing";
import { SITE_NAME } from "./site";

/**
 * app/opengraph-image.png. Next only applies a file-based image to pages that
 * don't set `openGraph` themselves, so the pages that do name it again.
 */
const SITE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
};

const OPEN_GRAPH_LOCALES = {
  en: "en_EG",
  ar: "ar_EG",
} satisfies Record<Locale, string>;

export function openGraphLocales(locale: Locale) {
  return {
    locale: OPEN_GRAPH_LOCALES[locale],
    alternateLocale: routing.locales
      .filter((other) => other !== locale)
      .map((other) => OPEN_GRAPH_LOCALES[other]),
  };
}

/** "/products" stays as is in English and becomes "/ar/products" in Arabic. */
export function localizedPath(path: string, locale: Locale) {
  return getPathname({ href: path, locale });
}

/** hreflang for a page that exists in every locale, with English as the x-default. */
export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, localizedPath(path, locale)]),
    ),
    "x-default": localizedPath(path, routing.defaultLocale),
  };
}

/**
 * Metadata merges shallowly, so a page that sets `openGraph` or `twitter`
 * drops the root layout's. This puts the shared fields back. The canonical is
 * the page's own locale URL: an /ar page that pointed at its English twin would
 * drop out of the index.
 */
export async function pageMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string;
  description: string;
  /** the unprefixed canonical path, also used as the Open Graph url */
  path: string;
  /** defaults to app/opengraph-image.png */
  images?: string[];
}) {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("common.metadata"),
  ]);
  const url = localizedPath(path, locale);
  const ogImages = images?.length
    ? images
    : [{ ...SITE_IMAGE, alt: t("siteImageAlt") }];

  return {
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      ...openGraphLocales(locale),
      title,
      description,
      url,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  } satisfies Metadata;
}
