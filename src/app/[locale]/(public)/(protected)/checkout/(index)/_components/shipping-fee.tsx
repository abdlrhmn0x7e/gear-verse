"use client";

import { useLocale, useTranslations } from "next-intl";
import { create } from "zustand";
import type { AddressGovernoratesEnum } from "~/lib/schemas/entities/address";
import { SHIPPING_RATES } from "~/lib/shipping-rates";
import { formatCurrency } from "~/lib/utils/format-currency";

// the form and the desktop summary sit in separate trees, so they share the governorate through a store
export const useShippingGovernorate = create<{
  governorate: AddressGovernoratesEnum | null;
}>(() => ({ governorate: null }));

/** The summary's shipping fee for the governorate picked in the checkout form. */
export function ShippingFee() {
  const locale = useLocale();
  const t = useTranslations("orders.totals");
  const governorate = useShippingGovernorate((state) => state.governorate);

  if (!governorate) {
    return (
      <p className="text-muted-foreground text-end">{t("pickGovernorate")}</p>
    );
  }

  return (
    <div className="text-end">
      <p className="text-lg font-medium">
        {t("from", {
          price: formatCurrency(SHIPPING_RATES[governorate], locale),
        })}
      </p>
      <p className="text-muted-foreground text-xs">
        {t("confirmedOnWhatsApp")}
      </p>
    </div>
  );
}
