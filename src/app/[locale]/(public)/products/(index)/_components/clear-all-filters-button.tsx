"use client";

import { FunnelXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAllProductSearchParams } from "~/components/features/products/hooks";
import { Button } from "~/components/ui/button";

export function ClearAllFiltersButton() {
  const t = useTranslations("products.filters");
  const [filters, setFilters] = useAllProductSearchParams();
  const hasFilters = Object.values(filters).some((value) => value !== null);

  return (
    <Button
      variant="outline"
      className="self-start"
      disabled={!hasFilters}
      onClick={() => void setFilters(null)}
    >
      <FunnelXIcon data-icon="inline-start" />
      {t("clear")}
    </Button>
  );
}
