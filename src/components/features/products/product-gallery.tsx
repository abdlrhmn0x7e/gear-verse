"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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
  const t = useTranslations("products.gallery");
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

  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [photosKey]);

  // the photos swipe; the thumbnails follow whichever one the scroller settles on
  function handleScroll(event: React.UIEvent<HTMLUListElement>) {
    const { scrollLeft, clientWidth } = event.currentTarget;
    if (!clientWidth) return;
    // RTL scrolls from 0 into negative scrollLeft
    const index = Math.round(Math.abs(scrollLeft) / clientWidth);
    if (index !== activeIndex && index >= 0 && index < photos.length) {
      setSelection({ key: photosKey, index });
    }
  }

  function showPhoto(index: number) {
    setSelection({ key: photosKey, index });
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const inline = getComputedStyle(scroller).direction === "rtl" ? -1 : 1;
    scroller.scrollTo({
      left: inline * index * scroller.clientWidth,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul
        ref={scrollerRef}
        onScroll={handleScroll}
        aria-label={photos.length > 1 ? t("photos", { title }) : undefined}
        className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-[2rem]"
      >
        {photos.map((photo, index) => (
          <li
            key={`${photo}-${index}`}
            className="image-well relative size-full shrink-0 snap-center snap-always"
          >
            <ImageWithFallback
              src={photo}
              alt={
                photos.length > 1
                  ? t("photoAlt", {
                      title,
                      index: index + 1,
                      total: photos.length,
                    })
                  : title
              }
              width={1200}
              height={1200}
              sizes="(min-width: 1024px) 55vw, 100vw"
              preload={index === 0}
              className="size-full rounded-none border-none bg-transparent p-[8%] [&_img]:object-contain"
            />
          </li>
        ))}
      </ul>

      {photos.length > 1 && (
        <ul
          aria-label={t("thumbnails")}
          className="no-scrollbar -mx-1.5 flex gap-3 overflow-x-auto p-1.5"
        >
          {photos.map((photo, index) => (
            <li key={`${photo}-${index}`} className="shrink-0">
              <button
                type="button"
                aria-label={t("showPhoto", {
                  index: index + 1,
                  total: photos.length,
                })}
                aria-current={index === activeIndex}
                onClick={() => showPhoto(index)}
                className={cn(
                  "image-well block size-20 overflow-hidden rounded-2xl outline-offset-2 transition-[outline-color] duration-150 md:size-24",
                  index === activeIndex
                    ? "outline-foreground outline-2"
                    : "hover:outline-border outline-2 outline-transparent",
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
