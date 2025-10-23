"use client";

import { type RouterOutputs } from "~/trpc/react";
import { Heading } from "~/components/heading";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { iconsMap } from "~/lib/icons-map";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Slider } from "~/components/ui/slider";
import { useAllProductSearchParams } from "./hooks";
import { formatCurrency } from "~/lib/utils/format-currency";
import { FolderIcon } from "lucide-react";
import { useMemo } from "react";

export function CategoryFilterItem({
  category,
}: {
  category: RouterOutputs["public"]["categories"]["queries"]["findAll"][number];
}) {
  const Icon = iconsMap.get(category.icon) ?? FolderIcon;
  const [filters, setFilters] = useAllProductSearchParams();
  const checked = useMemo(
    () => Boolean(filters.categories?.includes(category.slug)),
    [filters.categories, category.slug],
  );

  function handleCategoryChange(slug: string) {
    void setFilters((prev) => {
      if (prev.categories?.includes(slug)) {
        const filteredCategories = prev.categories.filter(
          (category) => category !== slug,
        );
        return {
          ...prev,
          categories: filteredCategories.length > 0 ? filteredCategories : null,
        };
      }

      return { ...prev, categories: [...(prev.categories ?? []), slug] };
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`category-${category.slug}`}
        checked={checked}
        onCheckedChange={() => handleCategoryChange(category.slug)}
      />
      <Label htmlFor={`category-${category.slug}`}>
        {Icon && <Icon className="size-4" />}
        {category.name}
      </Label>
    </div>
  );
}

export function BrandFilterItem({
  brand,
}: {
  brand: RouterOutputs["public"]["brands"]["queries"]["findAll"][number];
}) {
  const [filters, setFilters] = useAllProductSearchParams();
  const checked = useMemo(
    () => Boolean(filters.brands?.includes(brand.slug)),
    [filters.brands, brand.slug],
  );

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
    <div key={`brand-${brand.slug}`} className="flex items-center gap-2">
      <Checkbox
        id={`brand-${brand.slug}`}
        checked={checked}
        onCheckedChange={() => handleBrandChange(brand.slug)}
      />
      <Label htmlFor={`brand-${brand.slug}`}>
        <ImageWithFallback
          src={brand.logo}
          alt={brand.name}
          width={16}
          height={16}
          className="size-4 rounded-full"
        />
        {brand.name}
      </Label>
    </div>
  );
}

export function PriceFilter() {
  const [filters, setFilters] = useAllProductSearchParams();

  return (
    <div className="flex flex-col gap-4">
      <Heading level={4}>Price</Heading>
      <p className="text-muted-foreground text-sm">
        {formatCurrency(filters.minPrice ?? 0)} -{" "}
        {formatCurrency(filters.maxPrice ?? 99999)}
      </p>

      <Slider
        min={0}
        max={99999}
        value={[filters.minPrice ?? 0, filters.maxPrice ?? 99999]}
        onValueChange={(value) => {
          void setFilters((prev) => {
            return {
              ...prev,
              minPrice: value[0],
              maxPrice: value[1],
            };
          });
        }}
      />
    </div>
  );
}
