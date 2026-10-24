import { sql, type Column, type SQL } from "drizzle-orm";
import type { Locale } from "~/i18n/routing";

/** `english` as the storefront shows it in `locale`: its Arabic twin on the Arabic site when there is one. */
export function localized<T>(
  english: Column,
  arabic: Column,
  locale: Locale,
): SQL<T> {
  return (
    locale === "ar" ? sql`coalesce(${arabic}, ${english})` : sql`${english}`
  ).mapWith(english) as SQL<T>;
}

/** Whether `english` shows untranslated on the Arabic site, so the page can mark it as English. */
export function englishFallback(
  english: Column,
  arabic: Column,
  locale: Locale,
): SQL<boolean> {
  return locale === "ar"
    ? sql<boolean>`(${arabic} is null and ${english} is not null)`
    : sql<boolean>`false`;
}
