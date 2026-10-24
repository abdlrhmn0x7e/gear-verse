import { getLocale, getTranslations } from "next-intl/server";
import { formatCurrency } from "~/lib/utils/format-currency";

const DESCRIPTION_LENGTH = 160;
const TITLE_LENGTH = 60;

/**
 * The longest of "{title}: Price in Egypt | Gear Verse", "{title}: Price in
 * Egypt" and "{title}" (or their Arabic twins) that fits Google's ~60
 * characters, so a long product name keeps its own words instead of being cut
 * mid-name. Names stay in Latin script: Egyptians search with the English
 * product name plus Arabic words.
 */
export async function productPageTitle(title: string) {
  const t = await getTranslations("products.metadata");
  const name = title.replace(/\s+/g, " ").trim();
  const candidates = [
    t("productTitle", { title: name }),
    t("productTitleShort", { title: name }),
  ];
  return candidates.find((c) => c.length <= TITLE_LENGTH) ?? name;
}

/** The summary is one feature per line: "8K Polling Rate\n75% Layout" → "8K Polling Rate, 75% Layout". */
export function joinSummary(summary: string) {
  return summary
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * "Buy the {title} by {brand} in Egypt for {price}. {summary}. Cash on
 * delivery across Egypt." (or its Arabic twin), dropping summary features from
 * the end until it fits in about 160 characters.
 */
export async function productMetaDescription({
  title,
  brand,
  price,
  summary,
}: {
  title: string;
  brand: string | null;
  price: number;
  summary: string;
}) {
  const [t, locale] = await Promise.all([
    getTranslations("products.metadata"),
    getLocale(),
  ]);
  const values = { title, price: formatCurrency(price, locale) };
  const lead = brand
    ? t("productDescription", { ...values, brand })
    : t("productDescriptionNoBrand", values);
  const close = t("productDescriptionClose");

  const features = joinSummary(summary).split(", ").filter(Boolean);
  while (features.length > 0) {
    const sentence = `${features.join(", ").replace(/[.!]$/, "")}.`;
    const candidate = `${lead} ${sentence} ${close}`;
    if (candidate.length <= DESCRIPTION_LENGTH) return candidate;
    features.pop();
  }

  return `${lead} ${close}`;
}
