"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { type ReactNode, useLayoutEffect, useRef } from "react";

import { SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { AccountMenu } from "./account-menu";

/**
 * How the content sits in the page. "reading" is a centered column with real
 * margins, for records and forms; "full" spends the whole width; "fill" also
 * pins the page to the viewport height (canvases, boards); "table" hands the
 * whole region to a list, edge to edge, which scrolls itself (`ListGrid`).
 */
export type PageContentWidth = "reading" | "full" | "fill" | "table";

const contentWidthClasses: Record<
  Exclude<PageContentWidth, "table">,
  string
> = {
  reading: "mx-auto w-full max-w-7xl px-4 py-6 md:px-8",
  full: "w-full px-4 py-6",
  fill: "min-h-0 px-4 py-6",
};

/**
 * The one page anatomy every admin screen shares, after the reference CRM: a
 * 58px header with the sidebar toggle, the path and title, the page's own
 * buttons and the account pill; then an optional toolbar row (search and
 * filters on the left, the page's actions on the right); then the content.
 * The header and toolbar stay put while the content scrolls beneath them.
 */
export function PageLayout({
  title,
  titleContent,
  description,
  parent,
  actions,
  toolbar,
  headerContent,
  contentWidth = "reading",
  contentClassName,
  children,
}: {
  title: string;
  /** Rendered on the title line: a status pill and the like. */
  titleContent?: ReactNode;
  /** A line above the content. Lists ("table") leave it out: their columns say enough. */
  description?: ReactNode;
  /** The page one level up, shown before the title. */
  parent?: { title: string; href: string };
  /** Page-level buttons: at the end of the toolbar row when there is one, in the header otherwise. */
  actions?: ReactNode;
  /** The row under the header for the page's search and filters. */
  toolbar?: ReactNode;
  /** Rendered in the header, before the account pill. */
  headerContent?: ReactNode;
  contentWidth?: PageContentWidth;
  contentClassName?: string;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Sticky parts of a page pin at --page-sticky-top and grow to
  // --page-sticky-height, which follows the scroller's height, so it is
  // measured rather than guessed.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const measure = () =>
      scroller.style.setProperty("--page-height", `${scroller.clientHeight}px`);

    const observer = new ResizeObserver(measure);
    observer.observe(scroller);

    return () => observer.disconnect();
  }, []);

  const table = contentWidth === "table";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* A list's own header row draws the line under the chrome; every other page takes it here. */}
      <header
        className={cn(
          "flex h-[58px] shrink-0 items-center gap-2 px-4",
          !table && "border-b",
        )}
      >
        <SidebarTrigger className="-ms-2 size-[30px] shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {parent && (
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-1.5"
            >
              <Link
                href={parent.href}
                className="text-muted-foreground hover:text-foreground max-w-56 truncate text-base font-medium transition-colors duration-150 ease-out max-sm:hidden"
              >
                {parent.title}
              </Link>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                aria-hidden
                className="text-muted-foreground size-3.5 shrink-0 max-sm:hidden rtl:rotate-180"
              />
            </nav>
          )}
          <h1 className="truncate text-base font-medium">{title}</h1>
          {titleContent}
        </div>
        <div className="admin-controls flex shrink-0 items-center gap-2">
          {headerContent}
          {!toolbar && actions}
          <AccountMenu />
        </div>
      </header>

      {toolbar && (
        <div className="admin-controls flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {toolbar}
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {table ? (
        <div
          ref={scrollerRef}
          className={cn(
            "relative flex min-h-0 flex-1 flex-col",
            contentClassName,
          )}
        >
          {children}
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className={cn(
            "flex min-h-0 flex-1 [scrollbar-gutter:stable] flex-col overscroll-none",
            "[--page-sticky-height:calc(var(--page-height,100svh)-3rem)] [--page-sticky-top:1.5rem]",
            contentWidth === "fill" ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          <div
            className={cn(
              "flex flex-1 flex-col gap-6",
              contentWidthClasses[contentWidth],
              contentClassName,
            )}
          >
            {description && (
              <p className="text-muted-foreground -mb-2 text-sm text-pretty">
                {description}
              </p>
            )}
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
