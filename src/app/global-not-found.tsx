import type { Metadata } from "next";
import { NotFoundContent } from "~/components/not-found-content";
import { RootDocument, siteMetadata } from "~/components/root-document";

export const metadata: Metadata = {
  ...siteMetadata,
  title: "Page not found",
};

/** URLs no route matches, such as a missing file. Storefront 404s render inside [locale] with the navbar instead. */
export default function GlobalNotFound() {
  return (
    <RootDocument locale="en">
      <NotFoundContent />
    </RootDocument>
  );
}
