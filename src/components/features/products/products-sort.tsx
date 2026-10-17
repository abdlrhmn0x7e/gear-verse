"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAllProductSearchParams } from "./hooks";

export function ProductsSort() {
  const [filters, setFilters] = useAllProductSearchParams();

  function handleSortChange(value: string) {
    void setFilters((prev) => {
      if (value === "default") {
        return {
          sortBy: null,
        };
      }

      if (value === filters.sortBy) {
        return prev;
      }

      return {
        sortBy: value as typeof filters.sortBy,
      };
    });
  }

  return (
    <Select
      defaultValue="default"
      // "newest" is also the default order, so both share one option
      value={
        !filters.sortBy || filters.sortBy === "newest"
          ? "default"
          : filters.sortBy
      }
      onValueChange={handleSortChange}
    >
      <SelectTrigger aria-label="Sort products" className="min-w-44">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>

      <SelectContent position="popper" align="end">
        <SelectItem value="default">Sort: Newest</SelectItem>
        <SelectItem value="oldest">Sort: Oldest</SelectItem>
        <SelectItem value="price-asc">Sort: Price, low to high</SelectItem>
        <SelectItem value="price-desc">Sort: Price, high to low</SelectItem>
      </SelectContent>
    </Select>
  );
}
