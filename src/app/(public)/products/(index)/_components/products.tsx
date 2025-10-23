import { Suspense } from "react";
import { Heading } from "~/components/heading";
import { cn } from "~/lib/utils";
import { api, HydrateClient } from "~/trpc/server";
import { ProductList, ProductListSkeleton } from "./product-list";
import { ProductsSort } from "./products-sort";
import { loadAllProductSearchParams } from "./hooks";
import type { SearchParams } from "nuqs/server";

export async function Products({
  className,
  searchParams,
}: {
  className?: string;
  searchParams: Promise<SearchParams>;
}) {
  const filters = await loadAllProductSearchParams(searchParams);
  void api.public.products.queries.getPage.prefetchInfinite({
    pageSize: 6,
    filters: {
      brands: filters.brands ?? undefined,
      categories: filters.categories ?? undefined,
      price: {
        min: filters.minPrice ?? undefined,
        max: filters.maxPrice ?? undefined,
      },
    },
    sortBy: filters.sortBy ?? undefined,
  });

  return (
    <section id="products" className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Heading level={3}>All Products</Heading>

        <ProductsSort />
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

        <ProductsSort />
      </div>

      <ProductListSkeleton />
    </section>
  );
}
