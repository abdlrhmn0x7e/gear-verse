"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAllProductSearchParams } from "./hooks";

const sortOptions = [
  { value: "default", label: "Sort: Newest" },
  { value: "oldest", label: "Sort: Oldest" },
  { value: "price-asc", label: "Sort: Price, low to high" },
  { value: "price-desc", label: "Sort: Price, high to low" },
];

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
      items={sortOptions}
      defaultValue="default"
      // "newest" is also the default order, so both share one option
      value={
        !filters.sortBy || filters.sortBy === "newest"
          ? "default"
          : filters.sortBy
      }
      onValueChange={(value) => {
        if (value) handleSortChange(value);
      }}
    >
      <SelectTrigger aria-label="Sort products" className="min-w-44">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>

      <SelectContent alignItemWithTrigger={false} align="end">
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
