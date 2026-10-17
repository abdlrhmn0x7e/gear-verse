"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
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

  if (products.length === 0) {
    return (
      <ProductsEmptyState
        hasFilters={Object.entries(filters).some(
          ([key, value]) => key !== "sortBy" && value !== null,
        )}
        onClearFilters={() => void setFilters(null)}
      />
    );
  }

  return (
    <>
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
