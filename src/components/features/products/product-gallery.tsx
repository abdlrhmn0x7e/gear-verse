"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { cn } from "~/lib/utils";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import type { StoredVariant } from "~/stores/variant-selection/store";

function scrollToPhoto(
  scroller: HTMLUListElement | null,
  strip: HTMLUListElement | null,
  index: number,
) {
  if (!scroller) return;
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
  const inline = getComputedStyle(scroller).direction === "rtl" ? -1 : 1;
  scroller.scrollTo({ left: inline * index * scroller.clientWidth, behavior });

  // centres the thumbnail by scrolling the strip alone; scrollIntoView would scroll the page too
  const thumb = strip?.children[index];
  if (!strip || !thumb) return;
  const stripBox = strip.getBoundingClientRect();
  const thumbBox = thumb.getBoundingClientRect();
  strip.scrollBy({
    left:
      thumbBox.left + thumbBox.width / 2 - (stripBox.left + stripBox.width / 2),
    behavior,
  });
}

export function ProductGallery({
  media,
  variantPhotos,
  title,
}: {
  media: string[];
  variantPhotos: string[];
  title: string;
}) {
  const t = useTranslations("products.gallery");
  const selectedVariant = useVariantSelectionStore(
    (store) => store.selectedVariant,
  );
  // every variant's photo first, so the default variant opens the gallery, then the product's own; shared photos show once
  const photos = [...new Set([...variantPhotos, ...media].filter(Boolean))];
  const variantIndex = selectedVariant
    ? photos.indexOf(selectedVariant.thumbnailUrl)
    : -1;

  // picking a variant moves the gallery to its photo; a swipe or a thumbnail then holds until the next pick
  const [pick, setPick] = useState<{
    variant: StoredVariant | null;
    index: number;
  }>({ variant: null, index: 0 });
  const activeIndex =
    pick.variant === selectedVariant ? pick.index : Math.max(variantIndex, 0);

  const scrollerRef = useRef<HTMLUListElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!selectedVariant || variantIndex < 0) return;
    scrollToPhoto(scrollerRef.current, stripRef.current, variantIndex);
  }, [selectedVariant, variantIndex]);

  // the photos swipe; the thumbnails follow whichever one the scroller settles on
  function handleScroll(event: React.UIEvent<HTMLUListElement>) {
    const { scrollLeft, clientWidth } = event.currentTarget;
    if (!clientWidth) return;
    // RTL scrolls from 0 into negative scrollLeft
    const index = Math.round(Math.abs(scrollLeft) / clientWidth);
    if (index !== activeIndex && index >= 0 && index < photos.length) {
      setPick({ variant: selectedVariant, index });
    }
  }

  function showPhoto(index: number) {
    setPick({ variant: selectedVariant, index });
    scrollToPhoto(scrollerRef.current, stripRef.current, index);
  }

  return (
    // min-w-0, or the thumbnail strip's full width sets the width of the page's one-column grid on phones
    <div className="flex min-w-0 flex-col gap-4">
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
              className="size-full rounded-none border-none bg-transparent"
            />
          </li>
        ))}
      </ul>

      {photos.length > 1 && (
        <ul
          ref={stripRef}
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
                  className="size-full rounded-none border-none bg-transparent"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
