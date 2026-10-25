import { MinusIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

export function QuantityStepper({
  quantity,
  itemLabel,
  onDecrement,
  onIncrement,
  canIncrement,
  pending = false,
  className,
}: {
  quantity: number;
  /** names the item in the button labels, e.g. "Decrease quantity of Akko TAC75" */
  itemLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
  canIncrement: boolean;
  pending?: boolean;
  className?: string;
}) {
  const t = useTranslations("cart.quantity");

  return (
    <div
      role="group"
      aria-label={t("group", { item: itemLabel })}
      className={cn(
        "surface-control inline-flex h-9 items-center rounded-full p-0.5",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDecrement}
        disabled={pending}
        aria-label={
          quantity === 1
            ? t("remove", { item: itemLabel })
            : t("decrease", { item: itemLabel })
        }
      >
        <MinusIcon />
      </Button>
      <output
        aria-live="polite"
        className="min-w-8 text-center text-sm font-medium tabular-nums"
      >
        {quantity}
      </output>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onIncrement}
        disabled={pending || !canIncrement}
        aria-label={t("increase", { item: itemLabel })}
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
