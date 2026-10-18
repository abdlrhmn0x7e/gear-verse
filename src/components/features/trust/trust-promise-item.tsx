import { cn } from "~/lib/utils";
import type { TrustPromise } from "./trust-promises";

/** A promise with its icon on a raised tile, for the soft grey panels on the home and product pages. The tile radius nests inside the panel's rounded-3xl and p-4. */
export function TrustPromiseItem({
  promise,
  className,
}: {
  promise: TrustPromise;
  className?: string;
}) {
  return (
    <li className={cn("flex items-center gap-4", className)}>
      <span className="bg-raised flex size-12 shrink-0 items-center justify-center rounded-lg shadow-xs">
        <promise.icon className="size-5" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium">{promise.title}</p>
        <p className="text-muted-foreground text-sm text-pretty">
          {promise.description}
        </p>
      </div>
    </li>
  );
}
