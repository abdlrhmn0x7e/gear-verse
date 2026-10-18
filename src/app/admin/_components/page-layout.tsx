"use client";

import Link from "next/link";
import { type ReactNode, useLayoutEffect, useRef } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

/**
 * How the content sits in the page. "reading" is a centered column with real
 * margins, for records and forms; "full" spends the whole width on lists and
 * tables; "fill" also pins the page to the viewport height (canvases, boards).
 */
export type PageContentWidth = "reading" | "full" | "fill";

// From md up the scroller is inset 4px on each side and 18px from the bottom
// (see below); the paddings here give those pixels back so content sits where
// it would against the card's edges.
const contentWidthClasses: Record<PageContentWidth, string> = {
  reading:
    "mx-auto w-full max-w-[calc(var(--container-7xl)-0.5rem)] md:px-9 md:pt-8 md:pb-3.5",
  full: "w-full md:px-9 md:pt-8 md:pb-3.5",
  fill: "",
};

/**
 * The one page anatomy every admin screen shares: a slim bar with the sidebar
 * trigger and the breadcrumb path, then the page title with its description
 * and actions, an optional toolbar row, then the content. Pages compose this
 * instead of hand-rolling headers so the chrome reads the same everywhere.
 */
export function PageLayout({
  title,
  titleContent,
  description,
  parent,
  actions,
  toolbar,
  headerContent,
  compact,
  stickyHeader,
  contentWidth = "reading",
  contentClassName,
  children,
}: {
  title: string;
  /** Rendered on the title line: state badges and the like. */
  titleContent?: ReactNode;
  description?: ReactNode;
  /** The page one level up, shown before the title in the breadcrumb. */
  parent?: { title: string; href: string };
  /** Page-level buttons, on the right of the title. */
  actions?: ReactNode;
  /** A row under the title for the page's search and filters. */
  toolbar?: ReactNode;
  /** Rendered inside the top bar, after the breadcrumb. */
  headerContent?: ReactNode;
  /**
   * Skip the in-content title block: the breadcrumb names the page and the
   * controls live in the top bar. For surfaces that need every vertical pixel.
   */
  compact?: boolean;
  /**
   * Pin the title block where it sits so the actions stay reachable on long
   * pages. Content fades out as it scrolls beneath.
   */
  stickyHeader?: boolean;
  contentWidth?: PageContentWidth;
  contentClassName?: string;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  // Sticky parts of a page pin at --page-sticky-top and grow to --page-sticky-height
  // (below). Both follow the scroller's height and the pinned title block's height,
  // which wraps with the page's width, so they are measured rather than guessed.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const heading = headingRef.current;

    if (!scroller) return;

    const measure = () => {
      scroller.style.setProperty("--page-height", `${scroller.clientHeight}px`);
      scroller.style.setProperty(
        "--page-header-height",
        `${heading?.offsetHeight ?? 0}px`,
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(scroller);

    if (heading) observer.observe(heading);

    return () => observer.disconnect();
  }, [stickyHeader, compact]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* The bar sits above the scroller, so the page's scrollbar starts below it and
          clear of the card's rounded top corner. It reserves the same gutter as the
          scroller so its right edge lines up with the content's. */}
      <header className="flex h-12 shrink-0 [scrollbar-gutter:stable] items-center gap-3 overflow-hidden px-4 md:mx-1 md:px-2">
        {/* Keep the persistent toggle reachable at every viewport width; the
            edge rail is only an additional desktop affordance. */}
        <SidebarTrigger className="shrink-0" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            {parent && (
              <>
                <BreadcrumbItem className="shrink-0">
                  <BreadcrumbLink asChild>
                    <Link href={parent.href}>{parent.title}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {headerContent}
        </div>
      </header>

      {/* The page scrolls here, inset from the card's edges so its scrollbar never runs
          into the rounded bottom corner (rounded-2xl, 18px) or touches the card's edge. */}
      {/* A part pinned at --page-sticky-top never moves: that is where it sits at rest,
          right below the pinned title block (2rem padding, the block, and the 0.75rem it
          leaves of the gap below it). Pinned, it may grow down to where the content ends
          (the 0.875rem bottom padding), so the page's end never pushes it up. */}
      <div
        ref={scrollerRef}
        className={cn(
          "flex min-h-0 flex-1 [scrollbar-gutter:stable] flex-col overscroll-none md:mx-1",
          "[--page-sticky-height:calc(var(--page-height,100svh)-var(--page-sticky-top)-0.875rem)]",
          stickyHeader
            ? "[--page-sticky-top:calc(2.75rem+var(--page-header-height,0px))]"
            : "[--page-sticky-top:2rem]",
          contentWidth === "fill"
            ? "overflow-hidden"
            : "overflow-y-auto md:mb-4.5",
        )}
      >
        <div
          className={cn(
            "flex flex-1 flex-col gap-6 p-4 md:px-5 md:py-6",
            contentWidth === "fill" && "min-h-0",
            contentWidthClasses[contentWidth],
            contentClassName,
          )}
        >
          {!compact && (
            <div
              ref={headingRef}
              className={cn(
                "flex shrink-0 flex-col gap-4",
                // Pinned where it rests, under the content's 2rem top padding, which
                // the ::before keeps covered. The bottom padding is taken out of the
                // gap below, and the fade fills the rest of it, so neither ever sits
                // over content.
                stickyHeader &&
                  "md:bg-background md:before:bg-background md:after:from-background md:sticky md:top-8 md:z-10 md:-mb-3 md:pb-3 md:before:absolute md:before:inset-x-0 md:before:bottom-full md:before:h-8 md:after:pointer-events-none md:after:absolute md:after:inset-x-0 md:after:top-full md:after:h-3 md:after:bg-linear-to-b",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    <h1 className="text-2xl font-medium tracking-tight text-balance">
                      {title}
                    </h1>
                    {titleContent}
                  </div>
                  {description && (
                    <p className="text-muted-foreground mt-1.5 text-sm text-pretty">
                      {description}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                  </div>
                )}
              </div>
              {toolbar && (
                <div className="flex flex-wrap items-center gap-2">
                  {toolbar}
                </div>
              )}
            </div>
          )}
          {compact && <h1 className="sr-only">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  );
}
