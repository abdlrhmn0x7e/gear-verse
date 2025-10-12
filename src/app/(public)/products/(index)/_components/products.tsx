import { Heading } from "~/components/heading";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";
import { ProductList, ProductListSkeleton } from "./product-list";
import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";
import { loadAllProductSearchParams } from "./hooks";
import { ProductsSort } from "./products-sort";

export async function Products({
  className,
  searchParams,
}: {
  className?: string;
  searchParams: Promise<SearchParams>;
}) {
  const filters = await loadAllProductSearchParams(searchParams);
  void api.public.products.queries.getPage.prefetchInfinite({
    pageSize: 9,
    filters: {
      brands: filters.brands ?? undefined,
      categories: filters.categories ?? undefined,
      price: {
        min: filters.minPrice ?? 0,
        max: filters.maxPrice ?? 9999,
      },
    },
  });

  return (
    <section id="products" className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Heading level={3}>All Products</Heading>

        <ProductsSort />
      </div>

      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </section>
  );
}
