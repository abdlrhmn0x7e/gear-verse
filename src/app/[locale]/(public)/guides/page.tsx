import type { Metadata } from "next";
import { ArrowRightIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { GUIDE_LIST } from "~/lib/seo/guides";
import { JsonLd } from "~/lib/seo/json-ld";
import { pageMetadata } from "~/lib/seo/metadata";
import { breadcrumbJsonLd } from "~/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guides.metadata");
  const title = t("title");

  return {
    title,
    ...(await pageMetadata({
      title,
      description: t("description"),
      path: "/guides",
    })),
  };
}

export default async function GuidesPage() {
  const [locale, t, tProducts] = await Promise.all([
    getLocale(),
    getTranslations("guides"),
    getTranslations("products"),
  ]);

  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tProducts("breadcrumbStore"), path: "/products" },
            { name: t("article.breadcrumbGuides"), path: "/guides" },
          ],
          locale,
        )}
      />

      <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-headline-sm md:text-display-sm text-balance">
            {t("index.title")}
          </h1>
          <p className="text-muted-foreground text-body-lg text-pretty">
            {t("index.description")}
          </p>
        </div>

        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/categories/iems" />}
        >
          {t("index.shopIems")}
          <ArrowRightIcon
            data-icon="inline-end"
            className="rtl:-scale-x-100"
          />
        </Button>
      </header>

      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {GUIDE_LIST.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="bg-card group focus-visible:outline-focus flex h-full flex-col justify-between gap-6 rounded-3xl p-6 transition-[scale,opacity] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:active:scale-[0.99] motion-reduce:active:opacity-70 md:p-7"
            >
              <div className="space-y-3">
                <h2 className="text-title text-balance">
                  {t(`articles.${guide.slug}.title`)}
                </h2>
                <p className="text-muted-foreground text-sm/relaxed text-pretty">
                  {t(`articles.${guide.slug}.summary`)}
                </p>
              </div>

              <span className="text-foreground inline-flex items-center gap-2 text-sm font-medium">
                {t("index.readGuide")}
                <ArrowRightIcon
                  className="size-4 transition-[translate] duration-150 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </MaxWidthWrapper>
  );
}
