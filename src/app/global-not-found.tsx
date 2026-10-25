import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotFoundContent } from "~/components/not-found-content";
import { RootDocument, siteMetadata } from "~/components/root-document";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({
    locale: "en",
    namespace: "errors.notFound",
  });
  return { ...siteMetadata, title: t("title") };
}

/** URLs no route matches, such as a missing file. Storefront 404s render inside [locale] with the navbar instead. */
export default function GlobalNotFound() {
  return (
    <RootDocument locale="en">
      <NotFoundContent />
    </RootDocument>
  );
}
