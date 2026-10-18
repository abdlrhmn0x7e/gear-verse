"use client";

import { FunnelXIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useCategoryProductsFilters } from "./hooks";

export function ClearAllFiltersButton() {
  const [, setFilters] = useCategoryProductsFilters();

  return (
    <Button
      variant="outline"
      className="self-start"
      onClick={() => void setFilters(null)}
    >
      <FunnelXIcon data-icon="inline-start" />
      Clear filters
    </Button>
  );
}
