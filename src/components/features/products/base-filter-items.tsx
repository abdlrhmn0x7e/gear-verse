"use client";

import { type RouterOutput } from "~/trpc/client";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Slider } from "~/components/ui/slider";
import { useAllProductSearchParams } from "~/components/features/products/hooks";
import { formatCurrency } from "~/lib/utils/format-currency";
import { FilterChip } from "./filter-chip";

const PRICE_MAX = 99999;

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-4 text-sm font-medium">{title}</legend>
      {children}
    </fieldset>
  );
}

export function BrandFilterItem({
  brand,
}: {
  brand: RouterOutput["public"]["brands"]["queries"]["findAll"][number];
}) {
  const [filters, setFilters] = useAllProductSearchParams();
  const pressed = Boolean(filters.brands?.includes(brand.slug));

  function handleBrandChange(slug: string) {
    void setFilters((prev) => {
      if (prev.brands?.includes(slug)) {
        const filteredBrands = prev.brands.filter((brand) => brand !== slug);
        return {
          ...prev,
          brands: filteredBrands.length > 0 ? filteredBrands : null,
        };
      }

      return { ...prev, brands: [...(prev.brands ?? []), slug] };
    });
  }

  return (
    <FilterChip
      pressed={pressed}
      onPressedChange={() => handleBrandChange(brand.slug)}
      className="pl-1.5"
    >
      <ImageWithFallback
        src={brand.logo}
        alt=""
        width={48}
        height={48}
        className="size-6 rounded-full border-none bg-white [&_img]:object-contain"
      />
      {brand.name}
    </FilterChip>
  );
}

export function PriceFilter() {
  const [filters, setFilters] = useAllProductSearchParams();
  const min = filters.minPrice ?? 0;
  const max = filters.maxPrice ?? PRICE_MAX;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted-foreground text-sm tabular-nums">
        {formatCurrency(min)} – {formatCurrency(max)}
      </p>

      <Slider
        min={0}
        max={PRICE_MAX}
        step={50}
        value={[min, max]}
        aria-label="Price range"
        onValueChange={(value) => {
          void setFilters((prev) => ({
            ...prev,
            minPrice: value[0],
            maxPrice: value[1],
          }));
        }}
      />
    </div>
  );
}

export function NoBrandsFound() {
  return (
    <p className="text-muted-foreground text-sm">No brands to filter by yet.</p>
  );
}
