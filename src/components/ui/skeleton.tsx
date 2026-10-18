import { cn } from "~/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    // accent, not muted: muted is the card and popover colour, so a muted placeholder vanishes on a panel or drawer
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-2xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
