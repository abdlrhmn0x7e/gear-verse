import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import type { SearchParams } from "nuqs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CategoryChips,
  SubCategoryChips,
} from "~/components/features/products/category-chips";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Skeleton } from "~/components/ui/skeleton";
import type { Locale } from "~/i18n/routing";
import { localizedCopyProps } from "~/lib/arabic";
import { findCategoryPath, getCategoryTree } from "~/lib/category-tree";
import { getCategorySeoConfig } from "~/lib/seo/category-content";
import { JsonLd } from "~/lib/seo/json-ld";
import { pageMetadata } from "~/lib/seo/metadata";
import { findSitemapEntries } from "~/lib/seo/sitemap-entries";
import {
  breadcrumbJsonLd,
  categoryTrail,
  collectionPageJsonLd,
} from "~/lib/seo/structured-data";
import { app } from "~/server/application";
import { CategorySeoSection } from "./_components/category-seo-section";
import { Filters } from "./_components/filters";
import { CATEGORY_PAGE_SIZE } from "./_components/product-list";
import { Products, StaticProductsGrid } from "./_components/products";
import { loadFilterSearchParams } from "./_components/utils";

// Category and product edits expire this page (`expire: 0`), and the blocking
// re-render that follows is checked for an App Shell. The navbar's usePathname
// and the params read below sit outside Suspense on purpose (a missing category
// is a real 404), so the check failed every category page with a 500.
export const instant = false;

export async function generateStaticParams() {
  const slugs = await app.public.categories.queries.findAllSlugs();
  if (slugs.length === 0) {
    return [{ slug: "__placeholder__" }];
  }

  return slugs;
}

async function findCategoryBySlug(slug: string) {
  const path = findCategoryPath(
    await getCategoryTree(),
    (node) => node.slug === slug,
  );
  return { path, category: path.at(-1) };
}

/** Cached first page of unfiltered products for the static shell and ItemList JSON-LD. */
async function getInitialCategoryProducts(slug: string, locale: Locale) {
  "use cache";

  cacheTag("recent-products", "sitemap", "categories-menu");

  return app.public.categories.queries.getProductsPage({
    pageSize: CATEGORY_PAGE_SIZE,
    slug,
    filters: {
      brands: undefined,
      attributes: [],
      price: undefined,
    },
    locale,
  });
}

/** Google cuts snippets at about 160 characters, so end on a whole word. */
function clampDescription(text: string) {
  if (text.length <= 160) return text;
  const space = text.lastIndexOf(" ", 157);
  return `${text.slice(0, space > 0 ? space : 157).trimEnd()}…`;
}

// filtered and sorted URLs get noindex from the proxy and canonicalise here, in each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [{ category }, indexable, t, tGuides] = await Promise.all([
    findCategoryBySlug(slug),
    findSitemapEntries(),
    getTranslations("products.metadata"),
    getTranslations("guides.categorySeo.categories"),
  ]);
  if (!category) {
    notFound();
  }

  const seoConfig = getCategorySeoConfig(slug);
  const title = seoConfig
    ? tGuides(`${seoConfig.slug}.metaTitle`)
    : t("categoryTitle", { name: category.name });
  const isEmpty = !indexable.categories.some((live) => live.slug === slug);

  return {
    title,
    ...(await pageMetadata({
      title,
      // an Arabic page without an Arabic description uses the Arabic template, not the English text
      description:
        category.description && !category.fallback?.description
          ? clampDescription(category.description)
          : t("categoryDescription", { name: category.name }),
      path: `/categories/${slug}`,
    })),
    // nothing to buy yet, so keep it out of the index until it has stock
    ...(isEmpty && { robots: { index: false, follow: true } }),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  if (slug === "__placeholder__") {
    notFound();
  }

  // the cached lookup runs before any Suspense boundary (there is no
  // loading.tsx on purpose), so an unknown category is a real 404 instead of a
  // streamed 200 with noindex
  const { path, category } = await findCategoryBySlug(slug);
  if (!category) {
    notFound();
  }
  const locale = await getLocale();
  const [t, tGuides, initialPage] = await Promise.all([
    getTranslations("products"),
    getTranslations("guides.categorySeo.categories"),
    getInitialCategoryProducts(slug, locale),
  ]);
  const seoConfig = getCategorySeoConfig(slug);
  const heading = seoConfig
    ? tGuides(`${seoConfig.slug}.heading`)
    : category.name;
  const collectionDescription =
    category.description && !category.fallback?.description
      ? category.description
      : t("metadata.categoryDescription", { name: category.name });

  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <JsonLd
        data={breadcrumbJsonLd(
          categoryTrail(path, t("breadcrumbStore")),
          locale,
        )}
      />
      {initialPage.data.length > 0 && (
        <JsonLd
          data={collectionPageJsonLd({
            name: heading,
            description: collectionDescription,
            path: `/categories/${slug}`,
            products: initialPage.data,
            locale,
          })}
        />
      )}
      <header className="max-w-2xl space-y-3">
        <h1 className="text-headline-sm md:text-display-sm text-balance">
          {seoConfig ? (
            heading
          ) : (
            <bdi {...localizedCopyProps(locale, category.fallback?.name)}>
              {category.name}
            </bdi>
          )}
        </h1>
        {/* dir="auto" for copy of unknown language; on the Arabic site the read model says which it is */}
        <p
          dir="auto"
          className="text-muted-foreground text-body-lg text-pretty"
          {...localizedCopyProps(locale, category.fallback?.description)}
        >
          {/* the name is a heading already, and singular names ("Mouse") don't fit inside a sentence */}
          {category.description ?? t("category.fallbackDescription")}
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3">
        <CategoryChips activeSlug={path[0]!.slug} />
        {/* one row per level; a level without live sub-categories renders nothing */}
        {path.map((node, i) => (
          <SubCategoryChips
            key={node.slug}
            parent={{ name: node.name, slug: node.slug }}
            activeSlug={path[i + 1]?.slug}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside aria-label={t("filters.title")} className="hidden lg:block">
          <div className="sticky top-24">
            {/* the filters read the URL, so they stream in */}
            <Suspense fallback={<Skeleton className="h-96" />}>
              <Filters slug={slug} />
            </Suspense>
          </div>
        </aside>

        <Suspense fallback={<StaticProductsGrid products={initialPage.data} />}>
          <FilteredProducts
            searchParams={searchParams}
            slug={slug}
            initialPage={initialPage}
            filtersPanel={<Filters slug={slug} />}
          />
        </Suspense>
      </div>

      <CategorySeoSection slug={slug} />
    </MaxWidthWrapper>
  );
}

/** Reads the filters from the URL, so only this part waits on the request. */
async function FilteredProducts({
  searchParams,
  ...props
}: {
  searchParams: Promise<SearchParams>;
  slug: string;
  initialPage: Awaited<ReturnType<typeof getInitialCategoryProducts>>;
  filtersPanel: React.ReactNode;
}) {
  const filters = loadFilterSearchParams(
    (await searchParams) as Record<string, string>,
  );

  return <Products filters={filters} {...props} />;
}
