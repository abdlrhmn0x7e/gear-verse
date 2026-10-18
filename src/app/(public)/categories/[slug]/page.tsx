import type { SearchParams } from "nuqs/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryChips } from "~/components/features/products/category-chips";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Skeleton } from "~/components/ui/skeleton";
import { findCategoryPath, getCategoryTree } from "~/lib/category-tree";
import { app } from "~/server/application";
import { Filters } from "./_components/filters";
import { Products, ProductsSkeleton } from "./_components/products";
import { loadFilterSearchParams } from "./_components/utils";

export async function generateStaticParams() {
  const slugs = await app.public.categories.queries.findAllSlugs();
  if (slugs.length === 0) {
    return [{ slug: "__placeholder__" }];
  }

  return slugs;
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
  const path = findCategoryPath(
    await getCategoryTree(),
    (node) => node.slug === slug,
  );
  const category = path.at(-1);
  if (!category) {
    notFound();
  }

  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-headline-sm md:text-display-sm text-balance">
          {category.name}
        </h1>
        <p className="text-muted-foreground text-body-lg text-pretty">
          Hand-imported {category.name} from international brands, customs
          cleared and delivered to your door.
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
