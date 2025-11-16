"use client";

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  SkullIcon,
  SparklesIcon,
} from "lucide-react";
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
      value={filters.sortBy ?? "default"}
      onValueChange={handleSortChange}
    >
      <SelectTrigger className="sm:w-xs">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="default">
          <div className="flex w-full items-center gap-2">
            <ArrowUpDownIcon />
            Default
          </div>
        </SelectItem>
        <SelectItem value="newest">
          <div className="flex w-full items-center gap-2">
            <SparklesIcon />
            Newest
          </div>
        </SelectItem>
        <SelectItem value="oldest">
          <div className="flex w-full items-center gap-2">
            <SkullIcon />
            Oldest
          </div>
        </SelectItem>
        <SelectItem value="price-asc">
          <div className="flex w-full items-center gap-2">
            <ArrowUpIcon />
            <span className="flex-1">Price: Low to High</span>
          </div>
        </SelectItem>
        <SelectItem value="price-desc">
          <div className="flex w-full items-center gap-2">
            <ArrowDownIcon />
            <span className="flex-1">Price: High to Low</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
