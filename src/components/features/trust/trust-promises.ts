import { BadgeCheckIcon, BanknoteIcon, TruckIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrustPromise = {
  /** its copy lives under `common.trust.<id>` */
  id: "delivery" | "originals" | "cod";
  icon: LucideIcon;
};

/** The promises the store already makes, shown on the home page, product pages and in the cart. */
export const TRUST_PROMISES = [
  {
    id: "delivery",
    icon: TruckIcon,
  },
  {
    id: "originals",
    icon: BadgeCheckIcon,
  },
  {
    id: "cod",
    icon: BanknoteIcon,
  },
] as const satisfies readonly TrustPromise[];
