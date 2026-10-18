import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";

/**
 * A horizontal snap row on phones so the next card peeks, a grid from tablets up (pass the md:grid-cols-* in className).
 * Paint containment keeps the off-screen cards from widening the mobile layout viewport.
 */
export function ProductRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <ul
      className={cn(
        "no-scrollbar -mx-6 -my-2 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 py-2 [contain:paint] md:m-0 md:grid md:gap-6 md:overflow-visible md:p-0 md:[contain:none]",
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function ProductRowItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li className={cn("w-[80vw] shrink-0 snap-start md:w-auto", className)}>
      {children}
    </li>
  );
}

/** Ends a short product row with a way to the full store, so the row never looks unfinished. */
export function StoreTile({ className }: { className?: string }) {
  return (
    <Link
      href="/products"
      className={cn(
        "bg-card hover:bg-accent group flex aspect-square flex-col justify-between gap-8 rounded-3xl p-6 transition-[background-color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus md:p-8",
        className,
      )}
    >
      <p className="text-title max-w-xs text-balance">
        A short list, and every pick on it is worth the money.
      </p>
      <span className="inline-flex items-center gap-2 text-sm font-medium">
        See the whole store
        <ArrowRightIcon
          className="size-4 transition-[translate] duration-150 group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
