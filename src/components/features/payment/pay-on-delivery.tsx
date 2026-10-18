import { BanknoteIcon, type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

type PayOnDeliveryMethod = {
  name: string;
  /** shown before the wordmark when there is no logo */
  icon?: LucideIcon;
  /** an official SVG mark; once one is added it replaces the wordmark, rendered grayscale to match the row */
  logo?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

/** How customers pay the courier at the door. Every order is paid on delivery; nothing is charged online. */
export const PAY_ON_DELIVERY_METHODS: readonly PayOnDeliveryMethod[] = [
  { name: "Cash", icon: BanknoteIcon },
  { name: "InstaPay" },
  { name: "Vodafone Cash" },
  { name: "Orange Cash" },
  { name: "e& cash" },
];

/** A label with the accepted methods as grey wordmark tiles; stacks when its container is narrow. */
export function PayOnDelivery({
  label = "Pay on delivery",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("@container", className)}>
      <div className="flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between @xl:gap-6">
        <p className="text-sm font-medium">{label}</p>
        <ul aria-label={label} className="flex flex-wrap gap-2">
          {PAY_ON_DELIVERY_METHODS.map((method) => (
            <li
              key={method.name}
              className="bg-logo-tile text-logo-tile-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold tracking-tight whitespace-nowrap"
            >
              {method.logo ? (
                <method.logo
                  role="img"
                  aria-label={method.name}
                  className="h-4 w-auto grayscale"
                />
              ) : (
                <>
                  {method.icon && (
                    <method.icon
                      className="size-4"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  )}
                  {method.name}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
