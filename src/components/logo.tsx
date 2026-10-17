import { cn } from "~/lib/utils";

/** The traced wordmark, painted with the current text color so one asset serves both themes. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Gear Verse"
      className={cn(
        "block aspect-[1952/1208] h-9 shrink-0 bg-current [mask:url(/logo.svg)_center/contain_no-repeat] forced-colors:bg-[CanvasText]",
        className,
      )}
    />
  );
}
