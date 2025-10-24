"use client";

import { type ComponentProps, type PropsWithChildren } from "react";
import { Heading } from "~/components/heading";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { iconsMap } from "~/lib/icons-map";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/trpc/client";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { formatCurrency } from "~/lib/utils/format-currency";
import { useAllProductSearchParams } from "./hooks";
import { Slider } from "~/components/ui/slider";
import { Button } from "~/components/ui/button";
import { XIcon } from "lucide-react";

export function CategoryFilterItem({
  category,
}: {
  category: RouterOutput["public"]["categories"]["queries"]["findAll"][number];
}) {
  const Icon = iconsMap.get(category.icon);
  const [filters, setFilters] = useAllProductSearchParams();

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
    <CustomCheckbox
      id={`category-${category.slug}`}
      defaultChecked={Boolean(filters.categories?.includes(category.slug))}
      onCheckedChange={() => handleCategoryChange(category.slug)}
    >
      <div className="flex w-full items-center justify-center gap-2">
        {Icon && <Icon className="size-6" />}
        <p>{category.name}</p>
      </div>
    </CustomCheckbox>
  );
}

export function BrandFilterItem({
  brand,
}: {
  brand: RouterOutput["public"]["brands"]["queries"]["findAll"][number];
}) {
  const [filters, setFilters] = useAllProductSearchParams();

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
    <CustomCheckbox
      id={`brand-${brand.slug}`}
      defaultChecked={Boolean(filters.brands?.includes(brand.slug))}
      onCheckedChange={() => handleBrandChange(brand.slug)}
    >
      <div className="flex w-full items-center justify-center gap-2">
        <ImageWithFallback
          src={brand.logo}
          alt={brand.name}
          width={16}
          height={16}
          className="size-6 rounded-full"
        />
        <p>{brand.name}</p>
      </div>
    </CustomCheckbox>
  );
}

export function CustomCheckbox({
  id,
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<typeof Checkbox>>) {
  return (
    <Label
      htmlFor={`${id}-checkbox`}
      className={cn(
        "has-data[state=checked]:text-primary-foreground has-data-[state=checked]:bg-primary/50 has-data-[state=checked]:border-primary cursor-pointer rounded-lg border p-2 px-4 transition-all",
        className,
      )}
    >
      <Checkbox className="hidden" id={`${id}-checkbox`} {...props} />
      {children}
    </Label>
  );
}

export function PriceFilter() {
  const [filters, setFilters] = useAllProductSearchParams();

  return (
    <div className="flex flex-col gap-4">
      <Heading level={2}>Price</Heading>
      <p className="text-muted-foreground text-center text-lg">
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

export function ClearAllButton({
  filterType,
}: {
  filterType: "categories" | "brands";
}) {
  const [filters, setFilters] = useAllProductSearchParams();

  function handleClearAll() {
    void setFilters((prev) => {
      return {
        ...prev,
        [filterType]: null,
      };
    });
  }

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={handleClearAll}
      disabled={!filters.categories?.length}
    >
      <XIcon />
      Clear all
    </Button>
  );
}
