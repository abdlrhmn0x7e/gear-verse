"use client";

import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { LoadMore } from "~/components/load-more";
import { useTRPC } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { ArrowUpRightIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { IconShoppingBagX } from "@tabler/icons-react";
import {
  ProductCard,
  ProductCardSkeleton,
} from "~/components/features/products/product-card";
import Link from "next/link";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryState, useQueryStates } from "nuqs";
import { useSearchParams } from "next/navigation";
import {
  getParsers,
  type AttributeFilter,
  type AttributeFilterKey,
  type AttributeFilterValue,
} from "./utils";
import type { CategoryProductsFilters } from "~/lib/schemas/contracts/public/categories";
import { useDebounce } from "~/hooks/use-debounce";

export function ProductList({ slug }: { slug: string }) {
  const sp = useSearchParams();
  const [filters] = useQueryStates(getParsers(sp));
  const attributeFilters = useMemo(
    () =>
      Array.from(Object.entries(filters)).reduce(
        (acc, [key, value]) => {
          if (
            key.startsWith("multi.") ||
            key.startsWith("select.") ||
            key.startsWith("bool.")
          ) {
            acc.push({
              type: key,
              value: value,
            } as AttributeFilter<"multi">); // any placeholder generic just to satisfy ts
          }

          return acc;
        },
        [] as CategoryProductsFilters["attributes"],
      ),
    [filters],
  );
  const parsedFilters = useDebounce({
    brands: filters.brands ?? undefined,
    attributes: attributeFilters,
    price: filters.maxPrice
      ? {
          min: filters.minPrice ?? 0,
          max: filters.maxPrice,
        }
      : undefined,
  } satisfies CategoryProductsFilters);

  const trpc = useTRPC();
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    trpc.public.categories.queries.getProductsPage.infiniteQueryOptions(
      {
        pageSize: 12,
        slug: slug,
        filters: parsedFilters,
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
    return <ProductListEmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 pb-32 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
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
    <div className="grid grid-cols-1 gap-4 pb-32 sm:grid-cols-2 lg:col-span-8 xl:col-span-9 xl:grid-cols-3 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductCardSkeleton key={`product-card-skeleton-${index}`} />
      ))}
    </div>
  );
}

function ProductListEmptyState() {
  return (
    <Empty className="h-2/3">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconShoppingBagX />
        </EmptyMedia>
        <EmptyTitle>No Products Found</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t find any products to display at the moment. Please
          check back later!
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className="flex-row items-center justify-center gap-0">
        <p className="text-muted-foreground">Need Something Specific?</p>
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <Link href="/contact">
            Contact Us
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
