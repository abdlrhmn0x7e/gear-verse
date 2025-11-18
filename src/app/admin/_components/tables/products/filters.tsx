"use client";

import { ListFilterIcon, TagIcon, TargetIcon } from "lucide-react";
import { SearchInput } from "../../inputs/search-input";
import { useProductSearchParams } from "../../../_hooks/use-product-search-params";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { cn } from "~/lib/utils";
import { BrandsCommand } from "../../inputs/brands-combobox";
import { useTRPC } from "~/trpc/client";
import { useInView } from "react-intersection-observer";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { debounce } from "nuqs";
import { CategoriesCommand } from "../../inputs/categories-combobox";
import { FilterList, type FilterKey } from "../../filter-list";
import { Button } from "~/components/ui/button";

export function ProductsFilter() {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useProductSearchParams();

  const { data: categories, isPending: categoriesPending } = useQuery(
    trpc.admin.categories.queries.findAll.queryOptions(),
  );

  const {
    data: brands,
    fetchNextPage,
    hasNextPage,
    isPending: brandsPending,
  } = useInfiniteQuery(
    trpc.admin.brands.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: keepPreviousData,
      },
    ),
  );
  const filteredBrands = useMemo(() => {
    return brands?.pages
      .flatMap((page) => page.data)
      .filter((brand) => filters.brands?.includes(brand.id));
  }, [filters, brands]);

  const { ref: brandsSpinnerRef, inView: brandsSpinnerInView } = useInView();
  useEffect(() => {
    if (brandsSpinnerInView && hasNextPage) {
      void fetchNextPage();
    }
  }, [brandsSpinnerInView, fetchNextPage, hasNextPage]);

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    void setFilters(
      (prev) => {
        if (!value) {
          return {
            ...prev,
            title: null,
          };
        }

        return {
          ...prev,
          title: value,
        };
      },
      { limitUrlUpdates: debounce(500) },
    );
  }

  function handleBrandsChange(value: number) {
    void setFilters(
      (prev) => {
        if (prev.brands?.includes(value)) {
          const filteredBrands = prev.brands.filter((brand) => brand !== value);
          return {
            ...prev,
            brands: filteredBrands.length > 0 ? filteredBrands : null,
          };
        }

        return { ...prev, brands: [...(prev.brands ?? []), value] };
      },
      { limitUrlUpdates: debounce(500) },
    );
  }

  function handleCategoriesChange(value: number) {
    void setFilters(
      (prev) => {
        if (prev.categories?.includes(value)) {
          const filteredCategories = prev.categories.filter(
            (category) => category !== value,
          );
          return {
            categories:
              filteredCategories.length > 0 ? filteredCategories : null,
          };
        }

        return { categories: [...(prev.categories ?? []), value] };
      },
      { limitUrlUpdates: debounce(500) },
    );
  }

  function handleFilterRemove({
    key,
    value,
  }: {
    key: FilterKey;
    value: number | string | null;
  }) {
    void setFilters((prev) => {
      const prevValue = prev[key as "brands" | "categories"]?.filter(
        (item) => item !== value,
      );
      if (prevValue?.length === 0) {
        return { ...prev, [key]: null };
      }

      return {
        ...prev,
        [key]: prevValue,
      };
    });
  }

  return (
    <div className="flex items-center gap-2">
      <SearchInput
        className="w-full max-w-sm"
        value={filters.title ?? ""}
        onChange={handleSearchChange}
      >
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger
            className={cn(isOpen && "dark:text-primary-foreground")}
            asChild
          >
            <Button variant="ghost" size="icon-sm" className="focus:ring-0">
              <ListFilterIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-sm"
            sideOffset={10}
            alignOffset={-8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={brandsPending}>
                  <TargetIcon className="mr-2 size-4" />
                  Brands
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    sideOffset={8}
                    alignOffset={-36}
                    className="p-0"
                  >
                    {brands && (
                      <BrandsCommand
                        brands={brands.pages.flatMap((page) => page.data)}
                        value={0}
                        onValueChange={handleBrandsChange}
                        setOpen={setIsOpen}
                        hasNextPage={hasNextPage}
                        ref={brandsSpinnerRef}
                      />
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={categoriesPending}>
                  <TagIcon className="mr-2 size-4" />
                  Categories
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    sideOffset={8}
                    alignOffset={-36}
                    className="p-0"
                  >
                    <CategoriesCommand
                      categories={categories ?? []}
                      setValue={handleCategoriesChange}
                      setOpen={setIsOpen}
                      value={0}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SearchInput>

      {categories && filteredBrands && (
        <FilterList
          brands={filteredBrands}
          categories={categories}
          filters={[
            {
              key: "brands",
              value: filters.brands ?? [],
            },
            {
              key: "categories",
              value: filters.categories ?? [],
            },
          ]}
          loading={brandsPending || categoriesPending}
          onRemove={handleFilterRemove}
        />
      )}
    </div>
  );
}
