"use client";

import { FunnelXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { useCategoryProductsFilters } from "./hooks";

export function ClearAllFiltersButton() {
  const t = useTranslations("products.filters");
  const [, setFilters] = useCategoryProductsFilters();

  return (
    <Button
      variant="outline"
      className="self-start"
      onClick={() => void setFilters(null)}
    >
      <FunnelXIcon data-icon="inline-start" />
      {t("clear")}
    </Button>
  );
}
