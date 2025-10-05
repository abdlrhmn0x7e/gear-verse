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

function ProductCard({
  product,
}: {
  product: RouterOutputs["public"]["products"]["queries"]["getPage"]["data"][number];
}) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-card space-y-3 rounded-lg border p-1">
        <AspectRatio
          ratio={16 / 10}
          className="overflow-hidden rounded-[calc(var(--radius)-var(--spacing))]"
        >
          <ImageWithFallback
            src={product.thumbnailUrl}
            alt={product.title}
            width={512}
            height={512}
            className="size-full rounded-none border-none"
          />
        </AspectRatio>

        <div className="space-y-3">
          <div className="space-y-3 px-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={product.brand.logoUrl}
                  alt={product.brand.name ?? "unknown brand"}
                  className="size-4 rounded-full"
                  width={16}
                  height={16}
                />

                <span className="text-md mb-1">{product.brand.name}</span>
              </div>

              <Heading level={4}>{product.title}</Heading>
            </div>

            <p className="line-clamp-3">{product.summary}</p>

            <p className="flex items-center justify-between gap-3">
              {product.strikeThroughPrice && (
                <span className="text-muted-foreground line-through">
                  {formatCurrency(product.strikeThroughPrice)}
                </span>
              )}

              <span className="text-primary-foreground text-xl font-semibold">
                {formatCurrency(product.price)}
              </span>
            </p>

            {product.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Available in {product.variants.length} variants
                </p>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Badge
                      key={`${variant.id}-${Object.values(variant.optionValues).join(", ")}`}
                      variant="outline"
                      className="px-1 py-px"
                    >
                      <ImageWithFallback
                        src={variant.thumbnailUrl}
                        alt={`${product.title} - ${Object.values(variant.optionValues).join(", ")}`}
                        className="size-4 rounded-full"
                        width={16}
                        height={16}
                      />

                      <span className="capitalize">
                        {Object.values(variant.optionValues)
                          .slice(0, 2)
                          .join(", ")}
                      </span>

                      {variant.stock > 0 ? (
                        <CheckCircleIcon className="size-3 text-green-500" />
                      ) : (
                        <XIcon className="size-3 text-red-500" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button className="w-full">
            <EyeIcon />
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}
