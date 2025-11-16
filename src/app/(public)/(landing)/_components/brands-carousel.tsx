"use client";

import { PackageOpenIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "~/components/ui/carousel";
import { type RouterOutput } from "~/trpc/client";
import { Progress } from "~/components/ui/progress";

export function BrandsCarousel({
  brands,
}: {
  brands: RouterOutput["public"]["brands"]["queries"]["findAll"];
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

  if (brands.length === 0) {
    return (
      <Empty className="gap-3">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-12">
            <PackageOpenIcon />
          </EmptyMedia>
        </EmptyHeader>

        <EmptyTitle className="text-2xl">No brands found</EmptyTitle>
        <EmptyDescription className="text-lg">
          We couldn&apos;t find any brands to display at the moment. Please
          check back later!
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="relative w-full">
      <Carousel setApi={setCarouselApi} className="w-full">
        <CarouselContent>
          {brands.map((brand, index) => (
            <CarouselItem
              key={`${brand.id}-${index}`}
              className="basis-2/5 lg:basis-2/12"
            >
              <BrandCard brand={brand} />
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

function BrandCard({
  brand,
}: {
  brand: RouterOutput["public"]["brands"]["queries"]["findAll"][number];
}) {
  return (
    <Link href={`/products/?brands=${brand.slug}`}>
      <div className="group flex h-full flex-col overflow-hidden rounded-lg border bg-white">
        <AspectRatio ratio={1} className="overflow-hidden">
          <ImageWithFallback
            src={brand.logo}
            alt={brand.name}
            className="size-full rounded-none border-none transition-transform duration-300 group-hover:scale-105"
            width={512}
            height={512}
          />
        </AspectRatio>
      </div>
    </Link>
  );
}

export function BrandsCarouselSkeleton() {
  return (
    <div className="relative w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {Array.from({ length: 6 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-3/5 sm:basis-2/5 lg:basis-2/12"
            >
              <AspectRatio className="overflow-hidden">
                <Skeleton className="size-full" />
              </AspectRatio>
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
