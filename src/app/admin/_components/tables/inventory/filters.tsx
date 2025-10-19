"use client";

import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { SearchInput } from "../../inputs/search-input";

export function InventoryItemFilter({ className }: { className?: string }) {
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
