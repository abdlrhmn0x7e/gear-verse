"use client";

import {
  ChevronRightIcon,
  ListFilterIcon,
  TagIcon,
  TargetIcon,
  XIcon,
} from "lucide-react";
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
import { api, type RouterOutputs } from "~/trpc/react";
import { useInView } from "react-intersection-observer";
import { motion } from "motion/react";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { debounce } from "nuqs";
import { CategoriesCommand } from "../../inputs/category-combobox";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { iconsMap } from "~/lib/icons-map";
import { useFlatCategories } from "~/hooks/use-flat-categories";

export function ProductsFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useProductSearchParams();
  const { data: categories, isPending: categoriesPending } =
    api.admin.categories.findAll.useQuery();
  const [brands, { fetchNextPage, hasNextPage, isPending: brandsPending }] =
    api.admin.brands.getPage.useSuspenseInfiniteQuery(
      {
        pageSize: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const filteredBrands = useMemo(() => {
    return brands.pages
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
        if (prev.name === value) {
          return {
            ...prev,
            name: undefined,
          };
        }

        return {
          ...prev,
          name: value,
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
            ...prev,
            categories:
              filteredCategories.length > 0 ? filteredCategories : null,
          };
        }

        return { ...prev, categories: [...(prev.categories ?? []), value] };
      },
      { limitUrlUpdates: debounce(500) },
    );
  }

  function handleFilterRemove({
    key,
    value,
  }: {
    key: FilterKey;
    value: number;
  }) {
    void setFilters((prev) => {
      const prevValue = prev[key]?.filter((brand) => brand !== value);
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
        className="h-full max-w-sm"
        value={filters.name ?? ""}
        onChange={handleSearchChange}
      >
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger
            className={cn(
              "text-muted-foreground hover:text-primary cursor-pointer transition-colors focus-visible:outline-none",
              isOpen && "text-primary",
            )}
          >
            <ListFilterIcon size={16} />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-sm"
            sideOffset={16}
            alignOffset={-12}
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
                    <BrandsCommand
                      brands={brands.pages.flatMap((page) => page.data)}
                      value={0}
                      onValueChange={handleBrandsChange}
                      setOpen={setIsOpen}
                      hasNextPage={hasNextPage}
                      ref={brandsSpinnerRef}
                    />
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
            <DropdownMenuPortal>hello</DropdownMenuPortal>
          </DropdownMenuContent>
        </DropdownMenu>
      </SearchInput>

      <FilterList
        brands={filteredBrands}
        categories={categories ?? []}
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
        loading={brandsPending}
        onRemove={handleFilterRemove}
      />
    </div>
  );
}

const itemVariant = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const listVariant = {
  hidden: { y: 10, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.05,
      staggerChildren: 0.06,
    },
  },
};

type FilterKey = "brands" | "categories";
type FilterValue = Record<FilterKey, number[]>;
type FilterValueProp = {
  key: FilterKey;
  value: FilterValue[FilterKey];
};

interface FilterListProps {
  filters: FilterValueProp[];
  loading: boolean;
  brands: RouterOutputs["admin"]["brands"]["getPage"]["data"];
  categories: RouterOutputs["admin"]["categories"]["findAll"];
  onRemove: ({ key, value }: { key: FilterKey; value: number }) => void;
}

function FilterList({
  brands,
  categories,
  filters,
  loading = false,
  onRemove,
}: FilterListProps) {
  const flattenedCategories = useFlatCategories(categories ?? []);

  function renderFilter({ key, value }: { key: FilterKey; value: number }) {
    switch (key) {
      case "brands":
        const brand = brands.find((brand) => brand.id === value);
        return (
          <div className="flex items-center gap-2">
            <div className="size-6 overflow-hidden rounded-sm border">
              <ImageWithFallback
                src={brand?.logoUrl}
                alt={brand?.name ?? `Brand name ${value}`}
                width={20}
                height={20}
                className="size-full object-cover"
              />
            </div>

            <p>{brand?.name ?? `Brand name ${value}`}</p>
          </div>
        );

      case "categories":
        const category = flattenedCategories.find(
          (category) => category.id === value,
        );

        return (
          <div className="flex items-center justify-start">
            {category?.path.map((p, idx) => {
              const Icon = iconsMap.get(p.icon);

              return (
                <div
                  key={`${p.name}-${idx}`}
                  className="flex items-center justify-start"
                >
                  {Icon && <Icon className="mr-1 size-4" />}
                  <span>{p.name}</span>
                  {idx != category?.path.length - 1 && (
                    <ChevronRightIcon className="opacity-50" />
                  )}
                </div>
              );
            })}
          </div>
        );
    }
  }

  return (
    <motion.ul
      variants={listVariant}
      initial="hidden"
      animate="show"
      className="flex space-x-2"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <motion.li key="1" variants={itemVariant}>
            <Skeleton className="h-8 w-[100px]" />
          </motion.li>
          <motion.li key="2" variants={itemVariant}>
            <Skeleton className="h-8 w-[100px]" />
          </motion.li>
        </div>
      ) : (
        filters.map(({ key, value }) =>
          value.map((value) => (
            <motion.li key={`${key}-${value}`} variants={itemVariant}>
              <Button
                variant="outline"
                className="group cursor-pointer has-[>svg]:px-0 has-[>svg]:pr-4 has-[>svg]:pl-0"
                onClick={() => onRemove({ key, value })}
              >
                <XIcon className="ml-0 size-0 scale-0 transition-all group-hover:ml-2 group-hover:size-4 group-hover:scale-100" />

                {renderFilter({ key, value })}
              </Button>
            </motion.li>
          )),
        )
      )}
    </motion.ul>
  );
}
