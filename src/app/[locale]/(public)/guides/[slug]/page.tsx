import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { ArrowRightIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductCard } from "~/components/features/products/product-card";
import { ProductRow, ProductRowItem } from "~/components/features/products/product-row";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
import { Link } from "~/i18n/navigation";
import type { Locale } from "~/i18n/routing";
import { GUIDES, GUIDE_SLUGS, isGuideSlug } from "~/lib/seo/guides";
import { JsonLd } from "~/lib/seo/json-ld";
import { pageMetadata } from "~/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "~/lib/seo/structured-data";
import { getStoreSettings } from "~/lib/store-settings";
import { app } from "~/server/application";

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

async function getFeaturedProducts(categorySlug: string, locale: Locale) {
  "use cache";

  cacheTag("recent-products", "sitemap", "categories-menu");

  const page = await app.public.categories.queries.getProductsPage({
    pageSize: 4,
    slug: categorySlug,
    filters: {
      brands: undefined,
      attributes: [],
      price: undefined,
    },
    locale,
  });

  return page.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isGuideSlug(slug)) {
    notFound();
  }

  const t = await getTranslations("guides.articles");
  const title = t(`${slug}.metaTitle`);
  const description = t(`${slug}.metaDescription`);

  return {
    title,
    ...(await pageMetadata({
      title,
      description,
      path: `/guides/${slug}`,
    })),
  };
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isGuideSlug(slug)) {
    notFound();
  }

  const guide = GUIDES[slug];
  const locale = await getLocale();
  const [t, tProducts, tWhatsApp, { whatsappNumber }, featuredProducts] =
    await Promise.all([
      getTranslations("guides"),
      getTranslations("products"),
      getTranslations("common.whatsapp"),
      getStoreSettings(),
      getFeaturedProducts(guide.featuredCategorySlug, locale),
    ]);

  const title = t(`articles.${slug}.title`);
  const description = t(`articles.${slug}.metaDescription`);

  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tProducts("breadcrumbStore"), path: "/products" },
            { name: t("article.breadcrumbGuides"), path: "/guides" },
            { name: title, path: `/guides/${slug}` },
          ],
          locale,
        )}
      />
      <JsonLd
        data={articleJsonLd({
          title,
          description,
          path: `/guides/${slug}`,
          datePublished: guide.datePublished,
          dateModified: guide.dateModified,
          locale,
        })}
      />

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/products" />}>
              {tProducts("breadcrumbStore")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/guides" />}>
              {t("article.breadcrumbGuides")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="max-w-2xl space-y-4">
        <h1 className="text-headline-sm md:text-display-sm text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground text-body-lg text-pretty">
          {t(`articles.${slug}.intro`)}
        </p>
      </header>

      <article className="typeset mt-10 max-w-2xl">
        {guide.sectionKeys.map((sectionKey) => (
          <section key={sectionKey}>
            <h2>
              {t(`articles.${slug}.sections.${sectionKey}.heading` as never)}
            </h2>
            <p>{t(`articles.${slug}.sections.${sectionKey}.body` as never)}</p>
          </section>
        ))}
      </article>

      <div className="bg-card mt-12 max-w-2xl space-y-4 rounded-3xl p-6 md:p-8">
        <h2 className="text-title text-balance">
          {t("article.needHelpHeading")}
        </h2>
        <p className="text-muted-foreground text-pretty">
          {t("article.needHelpBody")}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/categories/iems" />}
          >
            {t("article.shopIemsCta")}
            <ArrowRightIcon
              data-icon="inline-end"
              className="rtl:-scale-x-100"
            />
          </Button>
          {whatsappNumber && (
            <WhatsAppNumberLink
              number={whatsappNumber}
              message={tWhatsApp("question")}
              className="surface-control focus-visible:outline-focus inline-flex h-10 items-center rounded-full px-5 text-sm font-medium tabular-nums outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          )}
        </div>
      </div>

      {featuredProducts.length > 0 && (
        <section
          aria-labelledby="guide-products-heading"
          className="mt-16 space-y-8 border-t pt-12 md:pt-16"
        >
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <h2
                id="guide-products-heading"
                className="text-headline-sm text-balance"
              >
                {t("article.inStockHeading")}
              </h2>
              <p className="text-muted-foreground text-pretty">
                {t("article.inStockDescription")}
              </p>
            </div>
            <Link
              href={`/categories/${guide.featuredCategorySlug}`}
              className="group text-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm font-medium transition-[color] duration-150"
            >
              {t("article.shopCategory")}
              <ArrowRightIcon
                className="size-4 transition-[translate] duration-150 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>

          <ProductRow className="md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductRowItem key={product.id}>
                <ProductCard
                  product={product}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 80vw"
                />
              </ProductRowItem>
            ))}
          </ProductRow>
        </section>
      )}

      {guide.relatedSlugs.length > 0 && (
        <section
          aria-labelledby="related-guides-heading"
          className="mt-16 space-y-6 border-t pt-12"
        >
          <h2 id="related-guides-heading" className="text-title text-balance">
            {t("article.relatedHeading")}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {guide.relatedSlugs.map((relatedSlug) => (
              <li key={relatedSlug}>
                <Link
                  href={`/guides/${relatedSlug}`}
                  className="bg-card group focus-visible:outline-focus flex h-full flex-col justify-between gap-4 rounded-3xl p-6 transition-[scale,opacity] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:active:scale-[0.99]"
                >
                  <div className="space-y-2">
                    <h3 className="font-medium text-balance">
                      {t(`articles.${relatedSlug}.title`)}
                    </h3>
                    <p className="text-muted-foreground text-sm text-pretty">
                      {t(`articles.${relatedSlug}.summary`)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    {t("index.readGuide")}
                    <ArrowRightIcon
                      className="size-3.5 transition-[translate] duration-150 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </MaxWidthWrapper>
  );
}
