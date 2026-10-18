import type { Metadata } from "next";
import { SITE_NAME } from "./site";

/**
 * app/opengraph-image.png. Next only applies a file-based image to pages that
 * don't set `openGraph` themselves, so the pages that do name it again.
 */
const SITE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Gear Verse: imported gaming gear in Egypt",
};

/**
 * Metadata merges shallowly, so a page that sets `openGraph` or `twitter`
 * drops the root layout's. This puts the shared fields back.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string;
  description: string;
  /** the canonical path, also used as the Open Graph url */
  path: string;
  /** defaults to app/opengraph-image.png */
  images?: string[];
}) {
  const ogImages = images?.length ? images : [SITE_IMAGE];

  return {
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_EG",
      title,
      description,
      url: path,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  } satisfies Metadata;
}
