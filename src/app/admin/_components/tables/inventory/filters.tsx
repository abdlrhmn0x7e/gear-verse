"use client";

import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { SearchInput } from "../../inputs/search-input";

/**
 * Search across inventory items. The server filters inventory by this search
 * alone, so there are no filter chips here.
 */
export function InventoryFilters({ className }: { className?: string }) {
  const [filters, setFilters] = useInventorySearchParams();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    void setFilters({ inventorySearch: e.target.value });
  }

  return (
    <SearchInput
      placeholder="Search"
      className={className}
      value={filters.inventorySearch ?? ""}
      onChange={handleChange}
    />
  );
}

/** The name the inventory page and its loading state import. */
export { InventoryFilters as InventoryItemFilter };
