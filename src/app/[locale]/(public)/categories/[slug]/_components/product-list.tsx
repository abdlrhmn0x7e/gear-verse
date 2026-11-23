"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  ProductCard,
  ProductCardSkeleton,
  productGridClassName,
} from "~/components/features/products/product-card";
import { ProductsEmptyState } from "~/components/features/products/products-empty-state";
import { LoadMore } from "~/components/load-more";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useCategoryProductsFilters } from "./hooks";

export const CATEGORY_PAGE_SIZE = 24;

export type CategoryProductsPage =
  RouterOutput["public"]["categories"]["queries"]["getProductsPage"];

export function ProductList({
  slug,
  initialPage,
}: {
  slug: string;
  initialPage?: CategoryProductsPage;
}) {
  const [filters, setFilters] = useCategoryProductsFilters();
  const hasFilters =
    Boolean(filters.brands?.length) ||
    filters.attributes.length > 0 ||
    Boolean(filters.price);

  const trpc = useTRPC();
  const locale = useLocale();
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery({
    ...trpc.public.categories.queries.getProductsPage.infiniteQueryOptions(
      {
        pageSize: CATEGORY_PAGE_SIZE,
        slug,
        filters,
        locale,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
    ...(!hasFilters &&
      initialPage && {
        initialData: {
          pages: [initialPage],
          pageParams: [null],
        },
      }),
  });
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
        hasFilters={hasFilters}
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
