import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import {
  RootDocument,
  siteMetadata,
  siteViewport,
} from "~/components/root-document";
import { routing } from "~/i18n/routing";
import { openGraphLocales } from "~/lib/seo/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.metadata");
  const locale = await getLocale();

  return {
    ...siteMetadata,
    title: { default: t("title"), template: "%s | Gear Verse" },
    description: t("description"),
    openGraph: { ...siteMetadata.openGraph, ...openGraphLocales(locale) },
  };
}

export const viewport = siteViewport;

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootDocument locale={await getLocale()}>{children}</RootDocument>;
}
