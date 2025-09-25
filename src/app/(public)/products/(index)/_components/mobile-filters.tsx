"use client";

import { ListFilterIcon, XIcon } from "lucide-react";
import { type ComponentProps, type PropsWithChildren } from "react";
import { Heading } from "~/components/heading";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Label } from "~/components/ui/label";
import { iconsMap } from "~/lib/icons-map";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Separator } from "~/components/ui/separator";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { formatCurrency } from "~/lib/utils/format-currency";
import { useAllProductSearchParams } from "./hooks";
import { Slider } from "~/components/ui/slider";

export function MobileFilters() {
  return (
    <Drawer handleOnly>
      <DrawerTrigger className="lg:hidden" asChild>
        <Button variant="outline">
          <ListFilterIcon />
          <span className="hidden sm:block">Filters</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[calc(100vh-4rem)]">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div className="space-y-8 px-4 pb-32 md:px-8">
          <CategoryFilter />
          <Separator />
          <BrandFilter />
          <Separator />
          <PriceFilter />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CategoryFilter() {
  const [filters, setFilters] = useAllProductSearchParams();
  const { data: categories } = api.public.categories.findAll.useQuery({
    filters: { root: true },
  });

  function handleClearAll() {
    void setFilters((prev) => {
      return {
        ...prev,
        categories: null,
      };
    });
  }

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
      <div className="flex items-center justify-between">
        <Heading level={2}>Categories</Heading>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleClearAll}
          disabled={!filters.categories?.length}
        >
          <XIcon />
          Clear all
        </Button>
      </div>

      {categories && categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = iconsMap.get(category.icon);

            return (
              <CustomCheckbox
                key={`category-${category.id}`}
                id={`category-${category.id}`}
                checked={Boolean(filters.categories?.includes(category.id))}
                handleCheckChange={() => handleCategoryChange(category.id)}
              >
                <div className="flex w-full items-center justify-center gap-2">
                  {Icon && <Icon className="size-6" />}
                  <p>{category.name}</p>
                </div>
              </CustomCheckbox>
            );
          })}
        </div>
      ) : (
        <div>No categories found</div>
      )}
    </div>
  );
}

function BrandFilter() {
  const [filters, setFilters] = useAllProductSearchParams();
  const { data: brands } = api.public.brands.findAll.useQuery();

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

  function handleClearAll() {
    void setFilters((prev) => {
      return { ...prev, brands: null };
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Heading level={2}>Brands</Heading>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleClearAll}
          disabled={!filters.brands?.length}
        >
          <XIcon />
          Clear all
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {brands && brands.length > 0 ? (
          brands.map((brand) => (
            <CustomCheckbox
              key={`brand-${brand.id}`}
              id={`brand-${brand.id}`}
              checked={Boolean(filters.brands?.includes(brand.id))}
              handleCheckChange={() => handleBrandChange(brand.id)}
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
          ))
        ) : (
          <div>No brands found</div>
        )}
      </div>
    </div>
  );
}

function CustomCheckbox({
  id,
  children,
  className,
  handleCheckChange,
  ...props
}: PropsWithChildren<
  ComponentProps<typeof Checkbox> & {
    handleCheckChange: () => void;
  }
>) {
  return (
    <div className="relative flex items-center gap-2">
      <Checkbox
        id={id}
        className="peer hidden"
        onCheckedChange={(checked) => {
          props.onCheckedChange?.(checked);
          handleCheckChange();
        }}
        {...props}
      />

      <Label
        htmlFor={id}
        className={cn(
          "ring-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:bg-primary/50 cursor-pointer rounded-lg border p-2 px-4 transition-all peer-data-[state=checked]:ring-2",
          className,
        )}
      >
        {children}
      </Label>
    </div>
  );
}

function PriceFilter() {
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
