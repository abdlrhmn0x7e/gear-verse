"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { LoadMore } from "~/components/load-more";
import { api, type RouterOutputs } from "~/trpc/react";
import { useAllProductSearchParams } from "./hooks";
import { useDebounce } from "~/hooks/use-debounce";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { formatCurrency } from "~/lib/utils/format-currency";
import { Heading } from "~/components/heading";
import { Button } from "~/components/ui/button";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  EyeIcon,
  XIcon,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { IconShoppingBagX } from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";
import { ProductCard } from "~/components/product-card";

export function ProductList() {
  const [filters] = useAllProductSearchParams();
  const debouncedFilters = useDebounce(filters);
  const [data, { hasNextPage, fetchNextPage }] =
    api.public.products.queries.getPage.useSuspenseInfiniteQuery(
      {
        pageSize: 6,
        filters: {
          brands: debouncedFilters.brands ?? undefined,
          categories: debouncedFilters.categories ?? undefined,
          price: {
            min: debouncedFilters.minPrice ?? 0,
            max: debouncedFilters.maxPrice ?? 9999,
          },
        },
        sortBy: debouncedFilters.sortBy ?? undefined,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
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
            <a href="/contact">
              Contact Us
              <ArrowUpRightIcon />
            </a>
          </Button>
        </EmptyContent>
      </Empty>
    );
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
