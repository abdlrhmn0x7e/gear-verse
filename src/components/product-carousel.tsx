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
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";

export function ProductCarousel({
  className,
  photos,
}: {
  className?: string;
  photos: { id: number; url: string }[];
}) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentSlide(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className={cn("space-y-4", className)} dir="ltr">
      {/* Main Carousel */}
      <Carousel
        className="relative size-full overflow-hidden rounded-lg"
        setApi={setApi}
      >
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={1 / 1}>
                <SuspendableImage
                  src={photo.url}
                  alt={`Product Image ${index + 1}`}
                  isPriority={index === currentSlide}
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
                "hover:border-primary h-16 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-transparent transition-colors",
                currentSlide === index && "border-primary",
              )}
              onClick={() => {
                api?.scrollTo(index);
              }}
            >
              <div className="relative h-full w-full">
                <SuspendableImage
                  src={photo.url}
                  alt={`Product Thumbnail ${index + 1}`}
                  isPriority={false}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SuspendableImage({
  src,
  alt,
  isPriority = false,
}: {
  src: string;
  alt: string;
  isPriority?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div className="bg-muted flex h-full w-full items-center justify-center rounded-lg">
        <div className="text-muted-foreground text-center">
          <div className="text-sm">Failed to load image</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && <Skeleton className="h-full w-full" />}

      <Image
        src={src}
        alt={alt}
        fill
        priority={isPriority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          "rounded-lg object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
        )}
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
}
