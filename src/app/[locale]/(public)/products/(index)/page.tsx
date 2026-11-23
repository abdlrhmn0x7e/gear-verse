import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { CategoryChips } from "~/components/features/products/category-chips";
import { STORE_PAGE_SIZE } from "~/components/features/products/hooks";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import type { Locale } from "~/i18n/routing";
import { JsonLd } from "~/lib/seo/json-ld";
import { pageMetadata } from "~/lib/seo/metadata";
import { collectionPageJsonLd } from "~/lib/seo/structured-data";
import { app } from "~/server/application";
import { Filters } from "./_components/filters";
import { Products, StaticStoreProductsGrid } from "./_components/products";

/** Cached first page of unfiltered products for the static shell and ItemList JSON-LD. */
async function getInitialStoreProducts(locale: Locale) {
  "use cache";

  cacheTag("recent-products", "sitemap");

  return app.public.products.queries.getPage({
    pageSize: STORE_PAGE_SIZE,
    filters: {
      title: undefined,
      brands: undefined,
      categories: undefined,
      price: undefined,
    },
    sortBy: "trending",
    locale,
  });
}

// filtered and sorted URLs get noindex from the proxy and canonicalise here, in each locale
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products.metadata");
  const title = t("storeTitle");

  return {
    title,
    ...(await pageMetadata({
      title,
      description: t("storeDescription"),
      path: "/products",
    })),
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const locale = await getLocale();
  const [t, initialPage] = await Promise.all([
    getTranslations("products"),
    getInitialStoreProducts(locale),
  ]);

  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      {initialPage.data.length > 0 && (
        <JsonLd
          data={collectionPageJsonLd({
            name: t("store.title"),
            description: t("metadata.storeDescription"),
            path: "/products",
            products: initialPage.data,
            locale,
          })}
        />
      )}
      <header className="max-w-2xl space-y-3">
        <h1 className="text-headline-sm md:text-display-sm text-balance">
          {t("store.title")}
        </h1>
        <p className="text-muted-foreground text-body-lg text-pretty">
          {t("store.description")}
        </p>
      </header>

      <div className="mt-8">
        <CategoryChips activeSlug={null} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside aria-label={t("filters.title")} className="hidden lg:block">
          <div className="sticky top-24">
            <Suspense>
              <Filters />
            </Suspense>
          </div>
        </aside>

        <Suspense
          fallback={<StaticStoreProductsGrid products={initialPage.data} />}
        >
          <Products
            searchParams={searchParams}
            initialPage={initialPage}
            filters={<Filters />}
          />
        </Suspense>
      </div>
    </MaxWidthWrapper>
  );
}
