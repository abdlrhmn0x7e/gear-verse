import type { Locale } from "~/i18n/routing";
import type { StoreSettings } from "~/lib/schemas/entities/store-settings";
import { SHIPPING_RATES } from "~/lib/shipping-rates";
import { localizedPath } from "./metadata";
import { joinSummary } from "./product";
import { absoluteUrl, SITE_NAME, SITE_URL } from "./site";

// one store in every locale, so the ids never take a locale prefix
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The store's public profiles, from the admin store settings. The Discord
 * invite is a community, not a profile of the store, so it's left out.
 */
export function getSameAs(settings: StoreSettings) {
  return [
    settings.instagramUrl,
    settings.facebookUrl,
    settings.tiktokUrl,
    settings.xUrl,
    settings.youtubeUrl,
  ].filter((url): url is string => Boolean(url));
}

/**
 * What schema.org can say about the policy. The rest of it (defects, damage
 * or our mistakes only, reported within 24 hours of opening, inspected before
 * approval, refunded within 7 days, no change-of-mind returns) is on
 * /returns, which `merchantReturnLink` points to. We collect the product at
 * no charge, so it goes back by courier for free.
 */
function returnPolicy(locale: Locale) {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "EG",
    returnPolicyCountry: "EG",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 1,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
    refundType: "https://schema.org/FullRefund",
    merchantReturnLink: absoluteUrl(localizedPath("/returns", locale)),
  };
}

const rates = Object.values(SHIPPING_RATES);

/**
 * Google only reads country-level destinations for Egypt, so the range across
 * governorates stands in for the per-governorate rate. The farthest
 * governorates start at the top rate, so the highest "from" is also the
 * highest rate.
 */
const SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "EG" },
  shippingRate: {
    "@type": "MonetaryAmount",
    minValue: Math.min(...rates),
    maxValue: Math.max(...rates),
    currency: "EGP",
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 1,
      unitCode: "DAY",
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 2,
      unitCode: "DAY",
    },
  },
};

/** The store and the site, rendered once by the root layout. */
export function siteJsonLd(settings: StoreSettings, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/icon.png"),
        sameAs: getSameAs(settings),
        areaServed: { "@type": "Country", name: "Egypt" },
        currenciesAccepted: "EGP",
        paymentAccepted:
          "Cash on delivery, InstaPay, Vodafone Cash, Orange Cash, e& cash",
        hasMerchantReturnPolicy: returnPolicy(locale),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        inLanguage: `${locale}-EG`,
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

type BreadcrumbItem = { name: string; path: string };

/** `path`s are unprefixed; each item links to its page in `locale`. */
export function breadcrumbJsonLd(items: BreadcrumbItem[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localizedPath(item.path, locale)),
    })),
  };
}

/** The store, under its translated name, then the category from its root down to `category` itself. */
export function categoryTrail(
  categoryPath: { name: string; slug: string }[],
  storeName: string,
) {
  return [
    { name: storeName, path: "/products" },
    ...categoryPath.map((category) => ({
      name: category.name,
      path: `/categories/${category.slug}`,
    })),
  ];
}

const ITEM_CONDITIONS = {
  NEW: "https://schema.org/NewCondition",
  USED: "https://schema.org/UsedCondition",
  REFURBISHED: "https://schema.org/RefurbishedCondition",
};

export function productJsonLd({
  product,
  categoryPath,
  locale,
}: {
  product: {
    slug: string;
    title: string;
    summary: string;
    price: number;
    strikeThroughPrice: number | null;
    condition: "NEW" | "USED" | "REFURBISHED";
    inStock: boolean;
    allowBackorder: boolean;
    thumbnailUrl: string;
    media: string[];
    brand: { name: string | null } | null;
    reviews: { count: number; averageRating: number | null };
  };
  categoryPath: { name: string }[];
  locale: Locale;
}) {
  const url = absoluteUrl(localizedPath(`/products/${product.slug}`, locale));
  const images = [...new Set([product.thumbnailUrl, ...product.media])].filter(
    Boolean,
  );
  const description = joinSummary(product.summary);
  const hasDiscount =
    product.strikeThroughPrice != null &&
    product.strikeThroughPrice > product.price;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    url,
    image: images,
    ...(description && { description }),
    ...(product.brand?.name && {
      brand: { "@type": "Brand", name: product.brand.name },
    }),
    ...(categoryPath.length > 0 && {
      category: categoryPath.map((category) => category.name).join(" > "),
    }),
    offers: {
      "@type": "Offer",
      url,
      price: product.price.toFixed(2),
      priceCurrency: "EGP",
      ...(hasDiscount && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          priceType: "https://schema.org/StrikethroughPrice",
          price: product.strikeThroughPrice!.toFixed(2),
          priceCurrency: "EGP",
        },
      }),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : product.allowBackorder
          ? "https://schema.org/BackOrder"
          : "https://schema.org/OutOfStock",
      itemCondition: ITEM_CONDITIONS[product.condition],
      seller: { "@id": ORGANIZATION_ID },
      shippingDetails: SHIPPING_DETAILS,
      hasMerchantReturnPolicy: returnPolicy(locale),
    },
    // product reviews only: the store testimonials are not about this product
    ...(product.reviews.count > 0 &&
      product.reviews.averageRating != null && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.reviews.averageRating.toFixed(1),
          reviewCount: product.reviews.count,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };
}
