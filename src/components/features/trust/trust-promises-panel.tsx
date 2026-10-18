import { cn } from "~/lib/utils";
import { TrustPromiseItem } from "./trust-promise-item";
import { TRUST_PROMISES } from "./trust-promises";

/** The three promises in one grey panel, on the home and product pages. From lg they share a row:
 * justify-between makes both inner gaps equal and leaves the panel's own padding as the gap at each end. */
export function TrustPromisesPanel({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Our promises"
      className={cn(
        "bg-card flex flex-col gap-6 rounded-3xl p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-10 xl:px-24",
        className,
      )}
    >
      {TRUST_PROMISES.map((promise) => (
        <TrustPromiseItem key={promise.title} promise={promise} />
      ))}
    </ul>
  );
}
