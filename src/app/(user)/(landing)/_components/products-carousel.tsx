"use client";

import Link from "next/link";
import React from "react";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "~/components/ui/carousel";
import { Progress } from "~/components/ui/progress";
import { useIsMobile } from "~/hooks/use-mobile";
import { formatCurrency } from "~/lib/utils/format-currency";
import { api, type RouterOutputs } from "~/trpc/react";

export function ProductsCarousel() {
  const { data } = api.user.products.getPage.useQuery({
    pageSize: 10,
  });

  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const progress = (current * 100) / count;
  React.useEffect(() => {
    if (!carouselApi) {
      return;
    }
    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);
    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  if (!data) {
    return null;
  }

  return (
    <div className="relative w-full">
      <Carousel setApi={setCarouselApi} className="w-full">
        <CarouselContent>
          {[...data.data, ...data.data, ...data.data, ...data.data].map(
            (product, index) => (
              <CarouselItem
                key={`${product.id}-${index}`}
                className="sm:basis-1/2 lg:basis-1/4"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ),
          )}
        </CarouselContent>

        <CarouselPrevious className="top-[calc(100%+1rem)] left-0 size-10 translate-y-0" />
        <CarouselNext className="top-[calc(100%+1rem)] left-3 size-10 translate-x-full translate-y-0" />
      </Carousel>
      <Progress value={progress} className="mt-6 ml-auto w-24" />
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
      <div className="flex h-full flex-col overflow-hidden rounded-lg border">
        <AspectRatio ratio={1} className="border-b">
          <ImageWithFallback
            src={product.thumbnail}
            alt={product.name}
            className="size-full rounded-none border-none"
            width={512}
            height={512}
          />
        </AspectRatio>

        <div className="bg-muted flex-1 space-y-4 p-4">
          <div className="flex items-center justify-between">
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

          <div>
            <Heading level={4}>{product.name}</Heading>
            <p className="text-muted-foreground text-sm">{product.summary}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
