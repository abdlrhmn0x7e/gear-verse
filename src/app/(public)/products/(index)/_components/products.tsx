import { Suspense } from "react";
import { Heading } from "~/components/heading";
import { cn } from "~/lib/utils";
import { trpc, HydrateClient, prefetch } from "~/trpc/server";
import { ProductList, ProductListSkeleton } from "./product-list";
import { ProductsSort } from "./products-sort";
import { loadAllProductSearchParams } from "./hooks";
import type { SearchParams } from "nuqs/server";
import { MobileFilters } from "./mobile-filters";
import { Skeleton } from "~/components/ui/skeleton";

export async function Products({
  className,
  searchParams,
}: {
  className?: string;
  searchParams: Promise<SearchParams>;
}) {
  const filters = await loadAllProductSearchParams(searchParams);
  void prefetch(
    trpc.public.products.queries.getPage.infiniteQueryOptions({
      pageSize: 12,
      filters: {
        brands: filters.brands ?? undefined,
        categories: filters.categories ?? undefined,
        price:
          filters.maxPrice && filters.minPrice
            ? {
                min: filters.minPrice,
                max: filters.maxPrice,
              }
            : undefined,
      },
    }),
  );

  return (
    <section id="products" className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Heading level={3}>All Products</Heading>

        <Suspense fallback={<Skeleton className="h-9 sm:w-xs" />}>
          <div className="flex items-center gap-2">
            <ProductsSort />

            <MobileFilters />
          </div>
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

export function ProductsSkeleton({ className }: { className?: string }) {
  return (
    <section id="products" className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Heading level={3}>All Products</Heading>

        <Skeleton className="h-9 w-24" />
      </div>

      <ProductListSkeleton />
    </section>
  );
}
