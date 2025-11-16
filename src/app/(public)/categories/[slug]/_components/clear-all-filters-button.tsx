"use client";

import { IconFilterX } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { useCategoryProductsFilters } from "./hooks";

export function ClearAllFiltersButton() {
  const [, setFilters] = useCategoryProductsFilters();
  function handleClear() {
    void setFilters(null);
  }

  return (
    <Button className="w-full" onClick={handleClear} variant="outline">
      <IconFilterX />
      Clear Filters
    </Button>
  );
}
