"use client";

import { useEffect } from "react";
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
import { ProductCard, ProductCardSkeleton } from "~/components/product-card";
import Link from "next/link";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryState, useQueryStates } from "nuqs";
import { useSearchParams } from "next/navigation";
import { getParsers } from "./utils";
import type { CategoryProductsFilters } from "~/lib/schemas/contracts/public/categories";
import { useDebounce } from "~/hooks/use-debounce";

export function ProductList({ slug }: { slug: string }) {
  const sp = useSearchParams();
  const [filters] = useQueryStates(getParsers(sp));
  const parsedFilters = useDebounce(
    Array.from(Object.entries(filters)).map(
      ([key, value]) =>
        ({ type: key, value }) as CategoryProductsFilters[number],
    ),
  );

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
