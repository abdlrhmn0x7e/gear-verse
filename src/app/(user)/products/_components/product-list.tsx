"use client";

import { IconShoppingCartPlus } from "@tabler/icons-react";
import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { LoadMore } from "~/components/load-more";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/lib/utils/format-currency";
import { api, type RouterOutputs } from "~/trpc/react";
import { useAllProductSearchParams } from "./hooks";
import { useDebounce } from "~/hooks/use-debounce";

export function ProductList() {
  const [filters] = useAllProductSearchParams();
  const debouncedFilters = useDebounce(filters);
  const [data, { hasNextPage, fetchNextPage }] =
    api.user.products.getPage.useSuspenseInfiniteQuery(
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

function ProductCard({
  product,
}: {
  product: RouterOutputs["user"]["products"]["getPage"]["data"][number];
}) {
  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group flex h-full flex-col overflow-hidden rounded-lg border">
        <AspectRatio ratio={1} className="overflow-hidden">
          <ImageWithFallback
            src={product.thumbnail}
            alt={product.name}
            className="size-full rounded-none border-none transition-transform duration-300 group-hover:scale-105"
            width={512}
            height={512}
          />
        </AspectRatio>

        <Separator />

        <div className="bg-card flex flex-1 flex-col gap-4 p-4 text-center sm:text-left">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-2">
              <ImageWithFallback
                src={product.brand.logo}
                alt={product.brand.name ?? ""}
                className="size-6 rounded-full"
                width={48}
                height={48}
              />
              <span className="text-sm font-medium">{product.brand.name}</span>
            </div>

            <p className="text-muted-foreground text-sm">
              From {formatCurrency(product.price ?? 0)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Heading level={5} className="line-clamp-2 h-[3.25rem]">
              {product.name}
            </Heading>
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4" />
              <p className="text-muted-foreground text-sm">
                Available variants
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant, index) => (
                <Badge variant="outline" key={`${variant.name}-${index}`}>
                  <ImageWithFallback
                    src={variant.thumbnail}
                    alt={variant.name ?? ""}
                    className="size-4 rounded-full"
                    width={16}
                    height={16}
                  />
                  {variant.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex h-full items-end">
            <Button className="w-full" onClick={(e) => e.stopPropagation()}>
              <IconShoppingCartPlus />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
