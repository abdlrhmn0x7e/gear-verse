import { Suspense } from "react";
import { Heading } from "~/components/heading";
import { cn } from "~/lib/utils";
import { trpc, HydrateClient, prefetch } from "~/trpc/server";
import { ProductList, ProductListSkeleton } from "./product-list";
import { Skeleton } from "~/components/ui/skeleton";
import type { Filters } from "./utils";
import type { CategoryProductsFilters } from "~/lib/schemas/contracts/public/categories";

export async function Products({
  className,
  slug,
  filters,
}: {
  className?: string;
  slug: string;
  filters: Filters;
}) {
  const categoryName = slug.split("-").pop()!;
  const parsedFilters = Array.from(Object.entries(filters)).map(
    ([key, value]) => ({ type: key, value }) as CategoryProductsFilters[number],
  );
  void prefetch(
    trpc.public.categories.queries.getProductsPage.infiniteQueryOptions({
      pageSize: 12,
      slug,
      filters: parsedFilters,
    }),
  );

  return (
    <section id="products" className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Heading level={3}>{categoryName}</Heading>
      </div>

      <HydrateClient>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList slug={slug} />
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
