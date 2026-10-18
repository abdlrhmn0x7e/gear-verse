import { cn } from "~/lib/utils";

/** The traced wordmark, painted with the current text color (the brand logo colour by default) so one asset serves both themes. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Gear Verse"
      className={cn(
        "text-brand-logo block aspect-[5783/3525] h-11 shrink-0 bg-current [mask:url(/logo.svg)_center/contain_no-repeat] forced-colors:bg-[CanvasText]",
        className,
      )}
    />
  );
}
