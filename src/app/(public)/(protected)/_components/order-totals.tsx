import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/lib/utils/format-currency";

/** Subtotal and total for an order or cart. Shipping depends on the address and is confirmed by the team after the order, so no fee is shown or added here. */
export function OrderTotals({ subtotal }: { subtotal: number }) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground font-medium">Subtotal</p>
          <p className="text-lg font-medium">{formatCurrency(subtotal)}</p>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground font-medium">Shipping</p>
            <p className="text-muted-foreground text-xs">
              Estimated delivery: 1–2 business days
            </p>
          </div>

          <p className="text-muted-foreground text-end">
            Confirmed by our team
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground font-medium">Total</p>
        <p className="text-lg font-medium">
          {formatCurrency(subtotal)}
          <span className="text-muted-foreground text-sm font-normal">
            {" "}
            + shipping
          </span>
        </p>
      </div>
    </>
  );
}
