import type { StoreSettings } from "~/lib/schemas/entities/store-settings";
import { joinSummary } from "./product";
import { absoluteUrl, SITE_NAME, SITE_URL } from "./site";

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
 * approval, collected, refunded within 7 days, no change-of-mind returns) is
 * on /returns, which `merchantReturnLink` points to. There are no return fees
 * or method to state, and shipping is left out because its fee depends on
 * the address.
 */
function returnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "EG",
    returnPolicyCountry: "EG",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 1,
    refundType: "https://schema.org/FullRefund",
    merchantReturnLink: absoluteUrl("/returns"),
  };
}

/** The store and the site, rendered once by the root layout. */
export function siteJsonLd(settings: StoreSettings) {
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
        hasMerchantReturnPolicy: returnPolicy(),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        inLanguage: "en-EG",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** The store, then the category from its root down to `category` itself. */
export function categoryTrail(categoryPath: { name: string; slug: string }[]) {
  return [
    { name: "Store", path: "/products" },
    ...categoryPath.map((category) => ({
      name: category.name,
      path: `/categories/${category.slug}`,
    })),
  ];
}

export function productJsonLd({
  product,
  categoryPath,
}: {
  product: {
    slug: string;
    title: string;
    summary: string;
    price: number;
    strikeThroughPrice: number | null;
    inStock: boolean;
    thumbnailUrl: string;
    media: string[];
    brand: { name: string | null } | null;
    reviews: { count: number; averageRating: number | null };
  };
  categoryPath: { name: string }[];
}) {
  const url = absoluteUrl(`/products/${product.slug}`);
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
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORGANIZATION_ID },
      hasMerchantReturnPolicy: returnPolicy(),
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
