"use client";

import { useQueryStates } from "nuqs";
import { useSearchParams } from "next/navigation";
import { getParsers, type AttributeFilter } from "./utils";
import type { CategoryProductsFilters } from "~/lib/schemas/contracts/public/categories";
import { useDebounce } from "~/hooks/use-debounce";
import { useMemo } from "react";

export function useCategoryProductsFilters() {
  const sp = useSearchParams();
  const [filters, setFilters] = useQueryStates(getParsers(sp));
  const attributeFilters = useMemo(
    () =>
      Array.from(Object.entries(filters)).reduce(
        (acc, [key, value]) => {
          if (
            key.startsWith("multi.") ||
            key.startsWith("select.") ||
            key.startsWith("bool.")
          ) {
            acc.push({
              type: key,
              value: value,
            } as AttributeFilter<"multi">); // any placeholder generic just to satisfy ts
          }

          return acc;
        },
        [] as CategoryProductsFilters["attributes"],
      ),
    [filters],
  );

  const parsed = useDebounce({
    brands: filters.brands ?? undefined,
    attributes: attributeFilters,
    price: filters.maxPrice
      ? {
          min: filters.minPrice ?? 0,
          max: filters.maxPrice,
        }
      : undefined,
  } satisfies CategoryProductsFilters);

  return [parsed, setFilters] as const;
}
