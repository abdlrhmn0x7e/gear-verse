import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryChips } from "~/components/features/products/category-chips";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Skeleton } from "~/components/ui/skeleton";
import { findCategoryPath, getCategoryTree } from "~/lib/category-tree";
import { pageMetadata } from "~/lib/seo/metadata";
import { findSitemapEntries } from "~/lib/seo/sitemap-entries";
import { JsonLd } from "~/lib/seo/json-ld";
import { breadcrumbJsonLd, categoryTrail } from "~/lib/seo/structured-data";
import { app } from "~/server/application";
import { Filters } from "./_components/filters";
import { Products, ProductsSkeleton } from "./_components/products";
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

// filtered and sorted URLs get noindex from the proxy and canonicalise here
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [{ category }, indexable] = await Promise.all([
    findCategoryBySlug(slug),
    findSitemapEntries(),
  ]);
  if (!category) {
    notFound();
  }

  const title = `${category.name}: Imported, Delivered in Egypt`;
  const isEmpty = !indexable.categories.some((live) => live.slug === slug);

  return {
    title,
    ...pageMetadata({
      title,
      description: `${category.name}: hand-imported from international brands, customs cleared and delivered across Egypt. Prices in EGP, cash on delivery.`,
      path: `/categories/${slug}`,
    }),
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

  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <JsonLd data={breadcrumbJsonLd(categoryTrail(path))} />
      <header className="max-w-2xl space-y-3">
        <h1 className="text-headline-sm md:text-display-sm text-balance">
          {category.name}
        </h1>
        <p className="text-muted-foreground text-body-lg text-pretty">
          {/* the name is a heading already, and singular names ("Mouse") don't fit inside a sentence */}
          Hand-imported from international brands, customs cleared and delivered
          to your door.
        </p>
      </header>

      <div className="mt-8">
        <CategoryChips activeSlug={path[0]!.slug} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24">
            {/* the filters read the URL, so they stream in */}
            <Suspense fallback={<Skeleton className="h-96" />}>
              <Filters slug={slug} />
            </Suspense>
          </div>
        </aside>

        <Suspense fallback={<ProductsSkeleton />}>
          <FilteredProducts
            searchParams={searchParams}
            slug={slug}
            filtersPanel={<Filters slug={slug} />}
          />
        </Suspense>
      </div>
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
  filtersPanel: React.ReactNode;
}) {
  const filters = loadFilterSearchParams(
    (await searchParams) as Record<string, string>,
  );

  return <Products filters={filters} {...props} />;
}
