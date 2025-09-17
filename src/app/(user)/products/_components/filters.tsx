"use client";

import { api } from "~/trpc/react";
import { Heading } from "~/components/heading";
import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { iconsMap } from "~/lib/icons-map";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Slider } from "~/components/ui/slider";
import { useAllProductSearchParams } from "./hooks";
import { formatCurrency } from "~/lib/utils/format-currency";

export function Filters({ className }: { className?: string }) {
  return (
    <aside
      id="filters"
      className={cn(
        "sticky top-32 hidden h-full max-h-[calc(100vh-8rem)] overflow-y-scroll border-r px-1 lg:block",
        className,
      )}
    >
      <div className="flex flex-col gap-8 divide-y [&>*:not(:last-child)]:pb-8">
        <CategoryFilter />
        <BrandFilter />
        <PriceFilter />
      </div>
    </aside>
  );
}

function CategoryFilter() {
  const { data: categories } = api.user.categories.findAll.useQuery({
    filters: { root: true },
  });
  const [filters, setFilters] = useAllProductSearchParams();

  function handleCategoryChange(value: number) {
    void setFilters((prev) => {
      if (prev.categories?.includes(value)) {
        const filteredCategories = prev.categories.filter(
          (category) => category !== value,
        );
        return {
          ...prev,
          categories: filteredCategories.length > 0 ? filteredCategories : null,
        };
      }

      return { ...prev, categories: [...(prev.categories ?? []), value] };
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Heading level={4}>Categories</Heading>
      {categories && categories.length > 0 ? (
        categories.map((category) => {
          const Icon = iconsMap.get(category.icon);
          return (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={Boolean(filters.categories?.includes(category.id))}
                onCheckedChange={() => handleCategoryChange(category.id)}
              />
              <Label htmlFor={`category-${category.id}`}>
                {Icon && <Icon className="size-4" />}
                {category.name}
              </Label>
            </div>
          );
        })
      ) : (
        <div>No categories found</div>
      )}
    </div>
  );
}

function BrandFilter() {
  const { data: brands } = api.user.brands.findAll.useQuery();
  const [filters, setFilters] = useAllProductSearchParams();

  function handleBrandChange(value: number) {
    void setFilters((prev) => {
      if (prev.brands?.includes(value)) {
        const filteredBrands = prev.brands.filter((brand) => brand !== value);
        return {
          ...prev,
          brands: filteredBrands.length > 0 ? filteredBrands : null,
        };
      }

      return { ...prev, brands: [...(prev.brands ?? []), value] };
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Heading level={4}>Brands</Heading>
      {brands && brands.length > 0 ? (
        brands.map((brand) => (
          <div key={brand.id} className="flex items-center gap-2">
            <Checkbox
              id={`brand-${brand.id}`}
              checked={filters.brands?.includes(brand.id)}
              onCheckedChange={() => handleBrandChange(brand.id)}
            />
            <Label htmlFor={`brand-${brand.id}`}>
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
        ))
      ) : (
        <div>No brands found</div>
      )}
    </div>
  );
}

function PriceFilter() {
  const [filters, setFilters] = useAllProductSearchParams();

  return (
    <div className="flex flex-col gap-4">
      <Heading level={4}>Price</Heading>
      <p className="text-muted-foreground text-sm">
        {formatCurrency(filters.minPrice ?? 0)} -{" "}
        {formatCurrency(filters.maxPrice ?? 9999)}
      </p>
      <Slider
        min={0}
        max={9999}
        value={[filters.minPrice ?? 0, filters.maxPrice ?? 9999]}
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
