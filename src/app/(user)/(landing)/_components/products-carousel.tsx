"use client";

import { PackageOpenIcon } from "lucide-react";
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
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency } from "~/lib/utils/format-currency";
import { api, type RouterOutputs } from "~/trpc/react";

export function ProductsCarousel() {
  const [data] = api.user.products.getPage.useSuspenseQuery({
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

  if (!data || data.data.length === 0) {
    return (
      <div className="relative w-full">
        <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-lg">
          <PackageOpenIcon className="size-12" />
          <div className="space-y-2 text-center">
            <Heading level={2}>No products found</Heading>
            <div className="text-muted-foreground">
              <p>We are cooking something delicious for you.</p>
              <p>Check back later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Carousel setApi={setCarouselApi} className="w-full">
        <CarouselContent>
          {data.data.map((product, index) => (
            <CarouselItem
              key={`${product.id}-${index}`}
              className="basis-4/5 sm:basis-2/5 xl:basis-3/12"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="top-[calc(100%+1rem)] left-0 size-10 translate-y-0" />
        <CarouselNext className="top-[calc(100%+1rem)] left-3 size-10 translate-x-full translate-y-0" />
      </Carousel>
      <Progress value={progress} className="mt-6 ml-auto w-24" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="relative w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {Array.from({ length: 4 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-4/5 sm:basis-2/5 xl:basis-3/12"
            >
              <div className="group flex h-full flex-col overflow-hidden rounded-lg border">
                <AspectRatio ratio={1} className="overflow-hidden">
                  <Skeleton className="size-full rounded-none border-none" />
                </AspectRatio>

                <Separator />

                <div className="bg-muted flex-1 space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-6 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>

                  <div>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="mt-2 h-4 w-64" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="top-[calc(100%+1rem)] left-0 size-10 translate-y-0" />
        <CarouselNext className="top-[calc(100%+1rem)] left-3 size-10 translate-x-full translate-y-0" />
      </Carousel>
      <Skeleton className="mt-6 ml-auto h-4 w-36" />
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

        <div className="bg-muted flex-1 space-y-4 p-4 text-center sm:text-left">
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

          <div>
            <Heading level={4}>{product.name}</Heading>
          </div>
        </div>
      </div>
    </Link>
  );
}
