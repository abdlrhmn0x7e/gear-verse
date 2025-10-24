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

  return (
    <Select
      defaultValue="default"
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
      <SelectTrigger className="w-full max-w-3xs">
        <SelectValue
          placeholder={
            <>
              <ArrowUpDownIcon /> Sort by...
            </>
          }
        />
      </SelectTrigger>

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
