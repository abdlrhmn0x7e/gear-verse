import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // English keeps its unprefixed URLs; Arabic lives under /ar
  localePrefix: "as-needed",
  // a year, so a returning Arabic visitor who opens an English link lands on its /ar twin
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
  // hreflang comes from page metadata and the sitemap, which know which pages are indexable
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
