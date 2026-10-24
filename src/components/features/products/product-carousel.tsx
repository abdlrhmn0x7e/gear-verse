"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * A native scroll-snap row that keeps three cards in view from tablets up, with previous and next buttons; phones swipe
 * it like the plain product row. The browser's own scrolling carries the physics, so touch and trackpads feel native.
 */
export function ProductCarousel({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("products.carousel");
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function update() {
      if (!list) return;
      // RTL scrolls from 0 into negative scrollLeft
      const offset = Math.abs(list.scrollLeft);
      setEdges({
        atStart: offset <= 1,
        atEnd: offset + list.clientWidth >= list.scrollWidth - 1,
      });
    }

    update();
    list.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function scrollByCard(direction: 1 | -1) {
    const list = listRef.current;
    const card = list?.firstElementChild;
    if (!list || !card) return;

    const style = getComputedStyle(list);
    const gap = Number.parseFloat(style.columnGap) || 0;
    const inline = style.direction === "rtl" ? -1 : 1;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({
      left: inline * direction * (card.getBoundingClientRect().width + gap),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("space-y-4", className)}
    >
      <ul
        ref={listRef}
        className="no-scrollbar -mx-6 -my-2 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto overscroll-x-contain px-6 py-2 [contain:paint] md:mx-0 md:scroll-px-0 md:gap-6 md:px-0"
      >
        {children}
      </ul>

      <div className="hidden justify-end gap-2 md:flex">
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full"
          aria-label={t("previous")}
          disabled={edges.atStart}
          onClick={() => scrollByCard(-1)}
        >
          <ChevronLeftIcon className="rtl:-scale-x-100" />
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full"
          aria-label={t("next")}
          disabled={edges.atEnd}
          onClick={() => scrollByCard(1)}
        >
          <ChevronRightIcon className="rtl:-scale-x-100" />
        </Button>
      </div>
    </div>
  );
}

/** Three to a view from tablets up, the next one peeking on phones. */
export function ProductCarouselItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "w-[80vw] shrink-0 snap-start md:w-[calc((100%-3rem)/3)]",
        className,
      )}
    >
      {children}
    </li>
  );
}
