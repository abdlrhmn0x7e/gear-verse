import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/lib/utils/format-currency";
import { useLocale, useTranslations } from "next-intl";

/** Subtotal and total for an order or cart. Shipping depends on the address and is confirmed by the team after the order, so no fee is shown or added here. */
export function OrderTotals({ subtotal }: { subtotal: number }) {
  const locale = useLocale();
  const t = useTranslations("orders");

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground font-medium">{t("subtotal")}</p>
          <p className="text-lg font-medium">
            {formatCurrency(subtotal, locale)}
          </p>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground font-medium">{t("shipping")}</p>
            <p className="text-muted-foreground text-xs">
              {t("totals.estimate")}
            </p>
          </div>

          <p className="text-muted-foreground text-end">
            {t("totals.confirmedByTeam")}
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground font-medium">{t("total")}</p>
        <p className="text-lg font-medium">
          {formatCurrency(subtotal, locale)}
          <span className="text-muted-foreground text-sm font-normal">
            {" "}
            {t("plusShipping")}
          </span>
        </p>
      </div>
    </>
  );
}
