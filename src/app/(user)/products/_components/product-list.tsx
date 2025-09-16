"use client";

import { IconShoppingCartPlus } from "@tabler/icons-react";
import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/lib/utils/format-currency";
import { api, type RouterOutputs } from "~/trpc/react";

export function ProductList() {
  const [data] = api.user.products.getPage.useSuspenseInfiniteQuery(
    {
      pageSize: 9,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const products = data.pages.flatMap((page) => page.data);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
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

        <div className="bg-muted flex flex-1 flex-col gap-4 p-4 text-center sm:text-left">
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
