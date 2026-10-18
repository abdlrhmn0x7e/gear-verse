import type { MetadataRoute } from "next";
import { absoluteUrl } from "~/lib/seo/site";

/**
 * Checkout and orders stay crawlable on purpose: they carry noindex, which a
 * crawler can only see if it may fetch them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
