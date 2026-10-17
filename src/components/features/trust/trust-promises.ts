import { BadgeCheckIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrustPromise = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** The promises the store already makes, shown on the home page, product pages and in the cart. */
export const TRUST_PROMISES = [
  {
    icon: TruckIcon,
    title: "1–2 day delivery",
    description: "Most areas in Egypt get their order in 1–2 business days.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Customs cleared & insured",
    description:
      "We handle the invoices, declarations and customs. No surprise fees.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Money-back guarantee",
    description: "Not 100% satisfied? Ask us for a return or a refund.",
  },
] as const satisfies readonly TrustPromise[];
