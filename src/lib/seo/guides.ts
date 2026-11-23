export const GUIDE_SLUGS = [
  "best-iems-in-egypt",
  "iems-vs-gaming-headsets",
  "usb-c-dac-dongle-guide",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export type GuideConfig = {
  slug: GuideSlug;
  /** ISO date string for Article JSON-LD and sitemap lastModified */
  datePublished: string;
  dateModified: string;
  /** Category slug used to pull live in-stock picks at the bottom of the guide */
  featuredCategorySlug: string;
  /** Section keys under `guides.articles.<slug>.sections.<key>` */
  sectionKeys: readonly string[];
  /** Related guides shown at the bottom */
  relatedSlugs: readonly GuideSlug[];
};

export const GUIDES: Record<GuideSlug, GuideConfig> = {
  "best-iems-in-egypt": {
    slug: "best-iems-in-egypt",
    datePublished: "2026-11-23",
    dateModified: "2026-11-23",
    featuredCategorySlug: "iems",
    sectionKeys: ["whatAreIems", "forGaming", "forMusic", "howToPick", "buyingInEgypt"],
    relatedSlugs: ["iems-vs-gaming-headsets", "usb-c-dac-dongle-guide"],
  },
  "iems-vs-gaming-headsets": {
    slug: "iems-vs-gaming-headsets",
    datePublished: "2026-11-23",
    dateModified: "2026-11-23",
    featuredCategorySlug: "iems",
    sectionKeys: ["imagingAndSound", "comfortInEgypt", "microphoneOptions", "whenToSwitch"],
    relatedSlugs: ["best-iems-in-egypt", "usb-c-dac-dongle-guide"],
  },
  "usb-c-dac-dongle-guide": {
    slug: "usb-c-dac-dongle-guide",
    datePublished: "2026-11-23",
    dateModified: "2026-11-23",
    featuredCategorySlug: "iems-dac",
    sectionKeys: ["threePointFiveVsDsp", "whyDacMatters", "pcVsMobile", "upgradeAccessories"],
    relatedSlugs: ["best-iems-in-egypt", "iems-vs-gaming-headsets"],
  },
};

export function isGuideSlug(slug: string): slug is GuideSlug {
  return slug in GUIDES;
}

export const GUIDE_LIST: GuideConfig[] = GUIDE_SLUGS.map((slug) => GUIDES[slug]);
