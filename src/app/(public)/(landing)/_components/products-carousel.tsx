"use client";

import { PackageOpenIcon } from "lucide-react";
import React from "react";
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
import { type RouterOutputs } from "~/trpc/react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { ProductCard } from "~/components/product-card";

export function ProductsCarousel({
  products,
}: {
  products: RouterOutputs["public"]["products"]["queries"]["getPage"]["data"];
}) {
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

  if (products.length === 0) {
    return (
      <Empty className="gap-3">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-12">
            <PackageOpenIcon />
          </EmptyMedia>
        </EmptyHeader>

        <EmptyTitle className="text-2xl">No products found</EmptyTitle>
        <EmptyDescription className="text-lg">
          We couldn&apos;t find any products to display at the moment. Please
          check back later!
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="relative w-full">
      <Carousel setApi={setCarouselApi} className="w-full">
        <CarouselContent>
          {products.map((product, index) => (
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
