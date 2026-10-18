"use client";

import { useState } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { cn } from "~/lib/utils";

export function ProductSummaryGallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = photos[activeIndex] ?? photos[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="image-well relative aspect-[4/3] overflow-hidden rounded-3xl">
        <ImageWithFallback
          key={active}
          src={active}
          alt={
            photos.length > 1
              ? `${title}, photo ${activeIndex + 1} of ${photos.length}`
              : title
          }
          width={1200}
          height={900}
          sizes="(min-width: 640px) 640px, 100vw"
          className="size-full rounded-none border-none bg-transparent p-[8%] [&_img]:object-contain"
        />
      </div>

      {photos.length > 1 && (
        <ul
          aria-label="Product photos"
          className="no-scrollbar -mx-1.5 flex gap-2 overflow-x-auto p-1.5"
        >
          {photos.map((photo, index) => (
            <li key={`${photo}-${index}`} className="shrink-0">
              <button
                type="button"
                aria-label={`Show photo ${index + 1} of ${photos.length}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "image-well block size-16 overflow-hidden rounded-2xl outline-2 outline-offset-2 transition-[outline-color] duration-150",
                  index === activeIndex
                    ? "outline-foreground"
                    : "hover:outline-border outline-transparent",
                  "focus-visible:outline-focus",
                )}
              >
                <ImageWithFallback
                  src={photo}
                  alt=""
                  width={128}
                  height={128}
                  className="size-full rounded-none border-none bg-transparent p-1.5 [&_img]:object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
