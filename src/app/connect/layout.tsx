import type { Metadata } from "next";

import {
  RootDocument,
  siteMetadata,
  siteViewport,
} from "~/components/root-document";

export const metadata: Metadata = {
  ...siteMetadata,
  robots: { index: false, follow: false },
};

export const viewport = siteViewport;

/** A root layout of its own: connecting ChatGPT or Claude happens in English, outside the storefront's [locale] segment. */
export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
