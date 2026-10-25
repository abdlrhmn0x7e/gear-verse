"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  ProductCard,
  ProductCardSkeleton,
  productGridClassName,
} from "~/components/features/products/product-card";
import { ProductsEmptyState } from "~/components/features/products/products-empty-state";
import { LoadMore } from "~/components/load-more";
import { useTRPC } from "~/trpc/client";
import { useCategoryProductsFilters } from "./hooks";

export function ProductList({ slug }: { slug: string }) {
  const [filters, setFilters] = useCategoryProductsFilters();

  const trpc = useTRPC();
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    trpc.public.categories.queries.getProductsPage.infiniteQueryOptions(
      {
        pageSize: 12,
        slug,
        filters,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
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
        hasFilters={
          Boolean(filters.brands?.length) ||
          filters.attributes.length > 0 ||
          Boolean(filters.price)
        }
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
