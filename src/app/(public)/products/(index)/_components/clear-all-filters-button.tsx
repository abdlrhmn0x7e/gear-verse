"use client";

import { IconFilterX } from "@tabler/icons-react";
import { useAllProductSearchParams } from "~/components/features/products/hooks";
import { Button } from "~/components/ui/button";

export function ClearAllFiltersButton() {
  const [, setFilters] = useAllProductSearchParams();
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
