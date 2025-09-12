"use client";

import { ListFilterIcon, XIcon } from "lucide-react";
import { SearchInput } from "../../inputs/search-input";
import { useProductSearchParams } from "../../../_hooks/use-product-search-params";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
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

export function ProductsFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useProductSearchParams();
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

  function handleBrandsRemove(brandId: number) {
    void setFilters((prev) => {
      const filteredBrands = prev.brands?.filter((brand) => brand !== brandId);
      if (filteredBrands?.length === 0) {
        return { ...prev, brands: null };
      }

      return {
        ...prev,
        brands: filteredBrands,
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
            className="w-sm p-0"
            sideOffset={16}
            alignOffset={-12}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2">
                Filter by Brands
              </DropdownMenuLabel>
              <BrandsCommand
                brands={brands.pages.flatMap((page) => page.data)}
                value={0}
                onValueChange={handleBrandsChange}
                setOpen={setIsOpen}
                hasNextPage={hasNextPage}
                ref={brandsSpinnerRef}
              />
            </DropdownMenuGroup>
            <DropdownMenuPortal>hello</DropdownMenuPortal>
          </DropdownMenuContent>
        </DropdownMenu>
      </SearchInput>

      <BrandsFilterList
        brands={filteredBrands}
        loading={brandsPending}
        onRemove={handleBrandsRemove}
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

function BrandsFilterList({
  brands,
  loading = false,
  onRemove,
}: {
  brands: RouterOutputs["admin"]["brands"]["getPage"]["data"];
  loading: boolean;
  onRemove: (brandId: number) => void;
}) {
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
        brands.map((brand) => (
          <motion.li key={`brands-${brand.id}`} variants={itemVariant}>
            <Button
              variant="outline"
              className="group cursor-pointer has-[>svg]:px-0 has-[>svg]:pr-4 has-[>svg]:pl-0"
              onClick={() => onRemove(brand.id)}
            >
              <XIcon className="ml-0 size-0 scale-0 transition-all group-hover:ml-2 group-hover:size-4 group-hover:scale-100" />

              <div className="flex items-center gap-2">
                <div className="size-6 overflow-hidden rounded-sm border">
                  <Image
                    src={brand.logoUrl ?? ""}
                    alt={brand.name}
                    width={20}
                    height={20}
                    className="size-full object-cover"
                  />
                </div>

                <p>{brand.name}</p>
              </div>
            </Button>
          </motion.li>
        ))
      )}
    </motion.ul>
  );
}
