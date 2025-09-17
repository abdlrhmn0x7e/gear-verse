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
import { MobileFilters } from "./mobile-filters";
import { useAllProductSearchParams } from "./hooks";

export function ProductsSort() {
  const [filters, setFilters] = useAllProductSearchParams();

  return (
    <Select
      value={filters.sortBy ?? "default"}
      onValueChange={(value) => {
        void setFilters((prev) => {
          if (value === "default") {
            return {
              ...prev,
              sortBy: null,
            };
          }

          if (value === filters.sortBy) {
            return prev;
          }

          return {
            ...prev,
            sortBy: value as typeof filters.sortBy,
          };
        });
      }}
    >
      <div className="flex items-center gap-2">
        <SelectTrigger className="w-full max-w-3xs">
          <SelectValue
            placeholder={
              <>
                <ArrowUpDownIcon /> Sort by...
              </>
            }
          />
        </SelectTrigger>
        <MobileFilters />
      </div>

      <SelectContent>
        <SelectItem value="default">
          <ArrowUpDownIcon />
          Default
        </SelectItem>
        <SelectItem value="newest">
          <SparklesIcon />
          Newest
        </SelectItem>
        <SelectItem value="oldest">
          <SkullIcon />
          Oldest
        </SelectItem>
        <SelectItem value="price-asc">
          <ArrowUpIcon />
          Price: Low to High
        </SelectItem>
        <SelectItem value="price-desc">
          <ArrowDownIcon />
          Price: High to Low
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
