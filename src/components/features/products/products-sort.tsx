"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAllProductSearchParams } from "./hooks";

// the values are the sortBy URL param, so only the labels are translated
const sortOptions = [
  { value: "default", key: "default" },
  { value: "newest", key: "newest" },
  { value: "oldest", key: "oldest" },
  { value: "price-asc", key: "priceAsc" },
  { value: "price-desc", key: "priceDesc" },
] as const;

export function ProductsSort() {
  const t = useTranslations("products.sort");
  const items = sortOptions.map((option) => ({
    value: option.value,
    label: t(option.key),
  }));
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
      items={items}
      defaultValue="default"
      value={filters.sortBy ?? "default"}
      onValueChange={(value) => {
        if (value) handleSortChange(value);
      }}
    >
      <SelectTrigger aria-label={t("label")} className="min-w-44">
        <SelectValue placeholder={t("placeholder")} />
      </SelectTrigger>

      <SelectContent alignItemWithTrigger={false} align="end">
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
