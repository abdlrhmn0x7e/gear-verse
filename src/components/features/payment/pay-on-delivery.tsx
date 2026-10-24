import { BanknoteIcon, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";

type PayOnDeliveryMethod = {
  name: string;
  /** a line icon for methods without a brand mark (cash) */
  icon?: LucideIcon;
  /** the official mark from /public/payments; its alt is the brand part of the name, so mark + label reads as the full name */
  logo?: { src: string; width: number; height: number; alt: string };
  /** text beside the icon or mark; a mark that already spells the name (InstaPay) has none */
  label?: string;
};

/** The ways customers pay: the shipping fee in advance by InstaPay or wallet, the rest to the courier in cash, InstaPay or wallet. */
export const PAY_ON_DELIVERY_METHODS: readonly PayOnDeliveryMethod[] = [
  { name: "Cash", icon: BanknoteIcon, label: "Cash" },
  {
    name: "InstaPay",
    logo: {
      src: "/payments/instapay.png",
      width: 152,
      height: 96,
      alt: "InstaPay",
    },
  },
  {
    name: "Vodafone Cash",
    logo: {
      src: "/payments/vodafone.svg",
      width: 141,
      height: 35,
      alt: "Vodafone",
    },
    label: "Cash",
  },
  {
    name: "Orange Cash",
    logo: { src: "/payments/orange.svg", width: 20, height: 20, alt: "Orange" },
    label: "Cash",
  },
  {
    name: "e& cash",
    logo: { src: "/payments/eand.svg", width: 530, height: 494, alt: "e&" },
    label: "cash",
  },
];

/** A label and note with the accepted methods as logo tiles; stacks when its container is narrow. */
export function PayOnDelivery({
  label,
  note,
  className,
}: {
  label?: string;
  /** pass null where the surrounding copy already explains shipping */
  note?: string | null;
  className?: string;
}) {
  const t = useTranslations("products.payment");
  const shownLabel = label ?? t("label");
  // shipping is confirmed per order, so the short promise never quotes a fee
  const shownNote = note === undefined ? t("note") : note;

  return (
    <div className={cn("@container", className)}>
      <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between @2xl:gap-8">
        <div className="space-y-1">
          <p className="text-sm font-medium">{shownLabel}</p>
          {shownNote && (
            <p className="text-muted-foreground max-w-sm text-sm text-pretty">
              {shownNote}
            </p>
          )}
        </div>
        <ul aria-label={shownLabel} className="flex flex-wrap gap-2">
          {PAY_ON_DELIVERY_METHODS.map((method) => (
            <li
              key={method.name}
              className="bg-logo-tile text-logo-tile-foreground inline-flex h-11 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold tracking-tight whitespace-nowrap"
            >
              {method.icon && (
                <method.icon
                  className="size-5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              )}
              {method.logo && (
                <Image
                  src={method.logo.src}
                  alt={method.logo.alt}
                  width={method.logo.width}
                  height={method.logo.height}
                  // full colour; add `grayscale` here for monochrome tiles
                  className="h-5 w-auto"
                />
              )}
              {/* a wallet's "Cash" is part of its brand name; only plain cash is translated */}
              {method.logo ? method.label : t("cash")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
