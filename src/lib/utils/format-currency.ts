import type { Locale } from "~/i18n/routing";

// Arabic keeps Western digits, as Egyptian shops and receipts write prices
const NUMBER_LOCALES = {
  en: "en-EG",
  ar: "ar-EG-u-nu-latn",
} satisfies Record<Locale, string>;

export function formatCurrency(amount: number, locale: Locale) {
  const whole = Number.isInteger(amount);
  return (
    new Intl.NumberFormat(NUMBER_LOCALES[locale], {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    })
      .formatToParts(amount)
      // CLDR writes the Arabic symbol "ج.م." with a trailing dot; the store writes "ج.م"
      .map((part) =>
        part.type === "currency" && locale === "ar" ? "ج.م" : part.value,
      )
      .join("")
  );
}
