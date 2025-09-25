"use client";

import { PackageOpenIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "~/components/ui/carousel";
import { Progress } from "~/components/ui/progress";
import { api, type RouterOutputs } from "~/trpc/react";

export function BrandsCarousel() {
  const { data: brands, isPending } = api.public.brands.findAll.useQuery();
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

  if (isPending) {
    return (
      <div className="relative w-full">
        <Carousel className="w-full">
          <CarouselContent>
            {Array.from({ length: 6 }).map((_, index) => (
              <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/6">
                <div className="group bg-card flex h-full flex-col overflow-hidden rounded-lg border">
                  <AspectRatio ratio={1} className="overflow-hidden p-8">
                    <Skeleton className="size-full rounded-none border-none" />
                  </AspectRatio>
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

  if (!brands || brands.length === 0) {
    return (
      <div className="relative w-full">
        <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-lg">
          <PackageOpenIcon className="size-12" />
          <div className="space-y-2 text-center">
            <Heading level={2}>No brands found</Heading>
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
          {brands.map((brand, index) => (
            <CarouselItem
              key={`${brand.id}-${index}`}
              className="basis-3/5 sm:basis-2/5 lg:basis-2/12"
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
  brand: RouterOutputs["public"]["brands"]["findAll"][number];
}) {
  return (
    <Link href={`/brands/${brand.slug}`}>
      <div className="group bg-card flex h-full flex-col overflow-hidden rounded-lg border">
        <AspectRatio ratio={1} className="overflow-hidden p-8">
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
