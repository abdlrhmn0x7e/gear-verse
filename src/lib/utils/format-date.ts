import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Locale } from "~/i18n/routing";

const DATE_FORMATS = {
  en: { pattern: "MMMM d, yyyy" },
  ar: { pattern: "d MMMM yyyy", locale: ar },
} satisfies Record<Locale, { pattern: string; locale?: typeof ar }>;

export function formatDate(date: Date, locale: Locale): string {
  const { pattern, ...options } = DATE_FORMATS[locale];
  return format(date, pattern, options);
}
