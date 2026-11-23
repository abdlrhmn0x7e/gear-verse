import type { GuideSlug } from "./guides";

/**
 * Slugs that carry curated SEO headings, buying context, and FAQs under
 * `guides.categorySeo.<slug>` in the message files. Any other category falls
 * back to its database name and description.
 */
export const SEO_CATEGORY_SLUGS = [
  "iems",
  "iems-dac",
  "iems-cables",
  "iems-ear-tips",
] as const;

export type SeoCategorySlug = (typeof SEO_CATEGORY_SLUGS)[number];

export type CategorySeoConfig = {
  slug: SeoCategorySlug;
  faqKeys: readonly string[];
  guideSlugs: readonly GuideSlug[];
  relatedCategories: readonly { slug: string; labelKey: SeoCategorySlug }[];
};

export const CATEGORY_SEO: Record<SeoCategorySlug, CategorySeoConfig> = {
  iems: {
    slug: "iems",
    faqKeys: ["whatAreIems", "gaming", "dacNeeded", "deliveryAndCod"],
    guideSlugs: [
      "best-iems-in-egypt",
      "iems-vs-gaming-headsets",
      "usb-c-dac-dongle-guide",
    ],
    relatedCategories: [
      { slug: "iems-dac", labelKey: "iems-dac" },
      { slug: "iems-cables", labelKey: "iems-cables" },
      { slug: "iems-ear-tips", labelKey: "iems-ear-tips" },
    ],
  },
  "iems-dac": {
    slug: "iems-dac",
    faqKeys: ["whenNeeded", "phoneAndPc"],
    guideSlugs: ["usb-c-dac-dongle-guide", "best-iems-in-egypt"],
    relatedCategories: [
      { slug: "iems", labelKey: "iems" },
      { slug: "iems-cables", labelKey: "iems-cables" },
    ],
  },
  "iems-cables": {
    slug: "iems-cables",
    faqKeys: ["connectors", "inlineMic"],
    guideSlugs: ["iems-vs-gaming-headsets", "best-iems-in-egypt"],
    relatedCategories: [
      { slug: "iems", labelKey: "iems" },
      { slug: "iems-ear-tips", labelKey: "iems-ear-tips" },
    ],
  },
  "iems-ear-tips": {
    slug: "iems-ear-tips",
    faqKeys: ["whyUpgrade", "sizing"],
    guideSlugs: ["best-iems-in-egypt"],
    relatedCategories: [
      { slug: "iems", labelKey: "iems" },
      { slug: "iems-cables", labelKey: "iems-cables" },
    ],
  },
};

export function getCategorySeoConfig(slug: string): CategorySeoConfig | null {
  if (slug in CATEGORY_SEO) {
    return CATEGORY_SEO[slug as SeoCategorySlug];
  }
  return null;
}
