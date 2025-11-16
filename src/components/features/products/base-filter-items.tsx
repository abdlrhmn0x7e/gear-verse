"use client";

import { type RouterOutput } from "~/trpc/client";
import { Heading } from "~/components/heading";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { iconsMap } from "~/lib/icons-map";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Slider } from "~/components/ui/slider";
import { useAllProductSearchParams } from "~/components/features/products/hooks";
import { formatCurrency } from "~/lib/utils/format-currency";
import { FolderIcon, FolderXIcon, PackageOpenIcon } from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

export function CategoryFilterItem({
  category,
}: {
  category: RouterOutput["public"]["categories"]["queries"]["findAll"][number];
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
        {/* eslint-disable-next-line react-hooks/static-components*/}
        {Icon && <Icon className="size-4" />}
        {category.name}
      </Label>
    </div>
  );
}

export function ItemsSkeleton() {
  return Array.from({ length: 5 }).map((_, index) => (
    <ItemSkeleton key={`skeleton-item-${index}`} />
  ));
}

function ItemSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox disabled />
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function BrandFilterItem({
  brand,
}: {
  brand: RouterOutput["public"]["brands"]["queries"]["findAll"][number];
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

      <div className="px-1">
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
    </div>
  );
}

export function PriceFilterSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Heading level={4}>Price</Heading>
      <p className="text-muted-foreground text-sm">
        {formatCurrency(0)} - {formatCurrency(99999)}
      </p>

      <Slider min={0} max={99999} value={[0, 99999]} disabled />
    </div>
  );
}

export function CategoryFilterEmptyState() {
  return (
    <Empty className="gap-0 p-0 md:p-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderXIcon />
        </EmptyMedia>
        <EmptyTitle>No categories found</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t find any categories to display at the moment. Please
          check back later!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function BrandFilterEmptyState() {
  return (
    <Empty className="gap-0 p-0 md:p-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No brands found</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t find any brands to display at the moment. Please
          check back later!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
