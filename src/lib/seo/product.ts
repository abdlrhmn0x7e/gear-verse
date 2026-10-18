import { formatCurrency } from "~/lib/utils/format-currency";

const DESCRIPTION_LENGTH = 160;

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
 * delivery across Egypt.", dropping summary features from the end until it
 * fits in about 160 characters.
 */
export function productMetaDescription({
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
  const lead = `Buy the ${title}${brand ? ` by ${brand}` : ""} in Egypt for ${formatCurrency(price)}.`;
  const close = "Cash on delivery across Egypt.";

  const features = joinSummary(summary).split(", ").filter(Boolean);
  while (features.length > 0) {
    const sentence = `${features.join(", ").replace(/[.!]$/, "")}.`;
    const candidate = `${lead} ${sentence} ${close}`;
    if (candidate.length <= DESCRIPTION_LENGTH) return candidate;
    features.pop();
  }

  return `${lead} ${close}`;
}
