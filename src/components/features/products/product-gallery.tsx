"use client";

import { useState } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { cn } from "~/lib/utils";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";

export function ProductGallery({
  media,
  title,
  variantCount,
}: {
  media: string[];
  title: string;
  variantCount: number;
}) {
  const selectedVariant = useVariantSelectionStore(
    (store) => store.selectedVariant,
  );
  const photos = (
    selectedVariant?.thumbnailUrl && variantCount > 1
      ? [selectedVariant.thumbnailUrl, ...media]
      : media
  ).filter(Boolean);

  // the selection is tied to the photo set it was made for, so a variant change starts at its own photo
  const photosKey = photos.join("|");
  const [selection, setSelection] = useState({ key: photosKey, index: 0 });
  const activeIndex = selection.key === photosKey ? selection.index : 0;
  const active = photos[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="image-well relative aspect-square overflow-hidden rounded-[2rem]">
        <ImageWithFallback
          key={active}
          src={active}
          alt={
            photos.length > 1
              ? `${title}, photo ${activeIndex + 1} of ${photos.length}`
              : title
          }
          width={1200}
          height={1200}
          sizes="(min-width: 1024px) 55vw, 100vw"
          preload
          className="size-full rounded-none border-none bg-transparent p-[8%] [&_img]:object-contain"
        />
      </div>

      {photos.length > 1 && (
        <ul
          aria-label="Product photos"
          className="no-scrollbar -mx-1.5 flex gap-3 overflow-x-auto p-1.5"
        >
          {photos.map((photo, index) => (
            <li key={`${photo}-${index}`} className="shrink-0">
              <button
                type="button"
                aria-label={`Show photo ${index + 1} of ${photos.length}`}
                aria-current={index === activeIndex}
                onClick={() => setSelection({ key: photosKey, index })}
                className={cn(
                  "image-well block size-20 overflow-hidden rounded-2xl outline-offset-2 transition-[outline-color] duration-150 md:size-24",
                  index === activeIndex
                    ? "outline-2 outline-foreground"
                    : "outline-2 outline-transparent hover:outline-border",
                  "focus-visible:outline-focus",
                )}
              >
                <ImageWithFallback
                  src={photo}
                  alt=""
                  width={192}
                  height={192}
                  className="size-full rounded-none border-none bg-transparent p-2 [&_img]:object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
