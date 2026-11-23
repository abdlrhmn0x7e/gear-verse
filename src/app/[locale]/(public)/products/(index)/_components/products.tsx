import type { SearchParams } from "nuqs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  loadAllProductSearchParams,
  toProductsPageInput,
} from "~/components/features/products/hooks";
import { MobileFiltersDrawer } from "~/components/features/products/mobile-filters-drawer";
import {
  ProductCard,
  productGridClassName,
} from "~/components/features/products/product-card";
import { ProductsSort } from "~/components/features/products/products-sort";
import { Skeleton } from "~/components/ui/skeleton";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import {
  ProductList,
  ProductListSkeleton,
  type StoreProductsPage,
} from "./product-list";

export async function Products({
  searchParams,
  filters: filtersPanel,
  initialPage,
}: {
  searchParams: Promise<SearchParams>;
  /** the filter panel, rendered again inside the mobile sheet */
  filters: React.ReactNode;
  initialPage: StoreProductsPage;
}) {
  const [filters, t] = await Promise.all([
    loadAllProductSearchParams(searchParams),
    getTranslations("products.listing"),
  ]);
  const isDefaultQuery =
    !filters.title &&
    !filters.brands?.length &&
    !filters.categories?.length &&
    filters.minPrice === null &&
    filters.maxPrice === null &&
    filters.sortBy === null;

  if (!isDefaultQuery) {
    void prefetch(
      trpc.public.products.queries.getPage.infiniteQueryOptions(
        toProductsPageInput(filters, await getLocale()),
        { getNextPageParam: (lastPage) => lastPage.nextCursor },
      ),
    );
  }

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

      {isDefaultQuery ? (
        <ProductList initialPage={initialPage} />
      ) : (
        <HydrateClient>
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList initialPage={initialPage} />
          </Suspense>
        </HydrateClient>
      )}
    </section>
  );
}

/** Static SSR product grid rendered in the Suspense fallback so the prerendered shell contains all initial products. */
export async function StaticStoreProductsGrid({
  products,
}: {
  products: StoreProductsPage["data"];
}) {
  const t = await getTranslations("products.listing");
  return (
    <section aria-label={t("heading")} className="min-w-0 space-y-8">
      <div className="flex justify-end">
        <Skeleton className="h-9 w-44 rounded-full" />
      </div>
      {products.length > 0 ? (
        <div className={productGridClassName}>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} eager={index < 2} />
          ))}
        </div>
      ) : (
        <ProductListSkeleton />
      )}
    </section>
  );
}
