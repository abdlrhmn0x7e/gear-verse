import { cn } from "~/lib/utils";

/**
 * The wordmark's "G" on its own, for the folded sidebar. It masks the same
 * traced logo, scaled so the letter (the left 23.5% and top 53.8% of the
 * artwork) fills the box, so the two never drift apart.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Gear Verse"
      className={cn(
        "text-brand-logo block aspect-[470/656] h-7 shrink-0 bg-current [mask:url(/logo.svg)_0_0/425.5%_auto_no-repeat] forced-colors:bg-[CanvasText]",
        className,
      )}
    />
  );
}
