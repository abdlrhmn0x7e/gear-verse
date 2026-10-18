"use client";

import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { ImageOffIcon } from "lucide-react";

export function SuspendableImage({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
} & React.ComponentProps<typeof Image>) {
  // A preloaded or eager image is above the fold, often the LCP element: it
  // shows from the server HTML instead of waiting for hydration to fade it in.
  const isEager =
    props.preload === true ||
    props.loading === "eager" ||
    props.fetchPriority === "high";
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  // if the component is remounted and loading is set to true, and src didn't change, set it to false
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading((prev) => !prev);
  }, []);

  if (hasError) {
    return (
      <div className="bg-muted flex size-full flex-col items-center justify-center gap-3 rounded-lg">
        <ImageOffIcon className="size-8" />
        <div className="text-muted-foreground text-center">
          <div className="text-sm">Failed to load image</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && !isEager && <Skeleton className="size-full rounded-none" />}

      <Image
        src={src}
        alt={alt}
        className={cn(
          "size-full object-cover",
          !isEager && "transition-opacity duration-300",
          isLoading && !isEager ? "opacity-0" : "opacity-100",
        )}
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </>
  );
}
