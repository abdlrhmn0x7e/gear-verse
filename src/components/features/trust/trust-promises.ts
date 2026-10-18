import { BadgeCheckIcon, BanknoteIcon, TruckIcon } from "lucide-react";
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
    icon: BadgeCheckIcon,
    title: "Originals only",
    description: "Most with the brand's warranty",
  },
  {
    icon: BanknoteIcon,
    title: "Cash on delivery",
    description: "Only shipping is paid up front",
  },
] as const satisfies readonly TrustPromise[];
