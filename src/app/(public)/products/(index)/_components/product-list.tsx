"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  toProductsPageInput,
  useAllProductSearchParams,
} from "~/components/features/products/hooks";
import {
  ProductCard,
  ProductCardSkeleton,
  productGridClassName,
} from "~/components/features/products/product-card";
import { ProductsEmptyState } from "~/components/features/products/products-empty-state";
import { LoadMore } from "~/components/load-more";
import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/client";

export function ProductList() {
  const [filters, setFilters] = useAllProductSearchParams();
  const debouncedFilters = useDebounce(filters);
  const trpc = useTRPC();
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    trpc.public.products.queries.getPage.infiniteQueryOptions(
      toProductsPageInput(debouncedFilters),
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );
  const products = data.pages.flatMap((page) => page.data);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  // the search dialog sends Enter here, so say what was searched and how to undo it
  const searchSummary = filters.title && (
    <div className="mb-6 flex items-center justify-between gap-3">
      <p className="text-muted-foreground min-w-0 truncate text-sm">
        Results for{" "}
        <span className="text-foreground font-medium">
          &ldquo;{filters.title}&rdquo;
        </span>
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void setFilters({ title: null })}
      >
        <XIcon data-icon="inline-start" />
        Clear search
      </Button>
    </div>
  );

  if (products.length === 0) {
    return (
      <>
        {searchSummary}
        <ProductsEmptyState
          hasFilters={Object.entries(filters).some(
            ([key, value]) => key !== "sortBy" && value !== null,
          )}
          onClearFilters={() => void setFilters(null)}
        />
      </>
    );
  }

  return (
    <>
      {searchSummary}
      <div className={productGridClassName}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <LoadMore hasNextPage={hasNextPage} ref={ref} />
    </>
  );
}

export function ProductListSkeleton() {
  return (
    <div className={productGridClassName}>
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
