"use client";

import { FunnelXIcon } from "lucide-react";
import { useAllProductSearchParams } from "~/components/features/products/hooks";
import { Button } from "~/components/ui/button";

export function ClearAllFiltersButton() {
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
      Clear filters
    </Button>
  );
}
