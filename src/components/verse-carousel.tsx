"use client";

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { SuspendableImage } from "./suspendable-image";

export function VerseCarousel({
  className,
  photos,
}: {
  className?: string;
  photos: string[];
}) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className={cn("space-y-4", className)} dir="ltr">
      {/* Main Carousel */}
      <Carousel className="relative overflow-hidden rounded-lg" setApi={setApi}>
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={1 / 1} className="h-full bg-white">
                <SuspendableImage
                  src={photo}
                  alt={`Product Image ${index + 1}`}
                  isPriority={index === currentSlide}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-lg object-cover object-center"
                  fill
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="default"
          className="absolute top-1/2 left-4 -translate-y-1/2"
        />
        <CarouselNext
          variant="default"
          className="absolute top-1/2 right-4 -translate-y-1/2"
        />
      </Carousel>

      {/* Thumbnail Navigation */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              className={cn(
                "hover:border-primary size-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border transition-all",
                currentSlide === index && "border-primary",
              )}
              onClick={() => {
                api?.scrollTo(index);
              }}
            >
              <div className="relative h-full w-full">
                <SuspendableImage
                  src={photo}
                  alt={`Product Thumbnail ${index + 1}`}
                  isPriority={false}
                  width={256}
                  height={256}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VerseCarouselSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-96 w-full rounded-lg" />
      <div className="flex gap-2 overflow-hidden">
        <Skeleton className="h-16 w-16 rounded-md" />
        <Skeleton className="h-16 w-16 rounded-md" />
        <Skeleton className="h-16 w-16 rounded-md" />
      </div>
    </div>
  );
}
