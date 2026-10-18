"use client";

import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { cn } from "~/lib/utils";
import { SearchInput } from "../../inputs/search-input";

/**
 * Search across inventory items, rendered straight into the page's toolbar
 * row. The server filters inventory by this search alone, so there are no
 * filter chips here.
 */
export function InventoryFilters({ className }: { className?: string }) {
  const [filters, setFilters] = useInventorySearchParams();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    void setFilters({ inventorySearch: e.target.value });
  }

  return (
    <SearchInput
      placeholder="Search by product name"
      aria-label="Search inventory"
      className={cn("w-full sm:w-72", className)}
      value={filters.inventorySearch ?? ""}
      onChange={handleChange}
    />
  );
}
