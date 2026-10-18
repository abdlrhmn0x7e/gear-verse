import { BadgeCheckIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrustPromise = {
  icon: LucideIcon;
  title: string;
  /** one short line, so the promise reads at a glance next to its icon */
  description: string;
};

/** The promises the store already makes, shown on the home page, product pages and in the cart. */
export const TRUST_PROMISES = [
  {
    icon: TruckIcon,
    title: "1–2 day delivery",
    description: "To most areas in Egypt",
  },
  {
    icon: ShieldCheckIcon,
    title: "Customs cleared & insured",
    description: "No surprise fees at your door",
  },
  {
    icon: BadgeCheckIcon,
    title: "Authentic gear",
    description: "From trusted brands",
  },
] as const satisfies readonly TrustPromise[];
