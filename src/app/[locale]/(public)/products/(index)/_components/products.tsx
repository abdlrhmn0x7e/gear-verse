import type { SearchParams } from "nuqs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  loadAllProductSearchParams,
  toProductsPageInput,
} from "~/components/features/products/hooks";
import { MobileFiltersDrawer } from "~/components/features/products/mobile-filters-drawer";
import { ProductsSort } from "~/components/features/products/products-sort";
import { Skeleton } from "~/components/ui/skeleton";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProductList, ProductListSkeleton } from "./product-list";

export async function Products({
  searchParams,
  filters: filtersPanel,
}: {
  searchParams: Promise<SearchParams>;
  /** the filter panel, rendered again inside the mobile sheet */
  filters: React.ReactNode;
}) {
  const [filters, t] = await Promise.all([
    loadAllProductSearchParams(searchParams),
    getTranslations("products.listing"),
  ]);
  void prefetch(
    trpc.public.products.queries.getPage.infiniteQueryOptions(
      toProductsPageInput(filters, await getLocale()),
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <section aria-labelledby="products-heading" className="min-w-0 space-y-8">
      <h2 id="products-heading" className="sr-only">
        {t("heading")}
      </h2>
      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <MobileFiltersDrawer>{filtersPanel}</MobileFiltersDrawer>
        <Suspense fallback={<Skeleton className="h-9 w-44 rounded-full" />}>
          <ProductsSort />
        </Suspense>
      </div>

      <HydrateClient>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList />
        </Suspense>
      </HydrateClient>
    </section>
  );
}

export async function ProductsSkeleton() {
  const t = await getTranslations("products.listing");
  return (
    <section aria-label={t("heading")} className="space-y-8">
      <div className="flex justify-end">
        <Skeleton className="h-9 w-44 rounded-full" />
      </div>
      <ProductListSkeleton />
    </section>
  );
}
