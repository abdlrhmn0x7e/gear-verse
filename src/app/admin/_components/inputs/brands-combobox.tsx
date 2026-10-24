"use client";

import * as React from "react";
import { TargetIcon, XCircleIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useInView } from "react-intersection-observer";
import { Spinner } from "~/components/spinner";
import Image from "next/image";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { LoadMore } from "~/components/load-more";
import { AddBrandDrawer } from "../drawers/add-brand";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

export function BrandsCombobox({
  value,
  onValueChange,
  disabled,
  className,
}: {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const { ref, inView } = useInView();
  const trpc = useTRPC();
  const {
    data: brands,
    isPending: brandsPending,
    isError: brandsError,
    fetchNextPage,
    hasNextPage,
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

  React.useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (brandsError) {
    return (
      <CommandTrigger className={className} aria-invalid disabled>
        <XCircleIcon className="text-destructive" />
        <span className="truncate">Couldn&apos;t load brands</span>
      </CommandTrigger>
    );
  }

  if (!brands || brandsPending) {
    return (
      <CommandTrigger className={className} disabled>
        <Spinner size="small" />
        <span className="text-muted-foreground truncate">Loading brands</span>
      </CommandTrigger>
    );
  }

  const brandsData = brands.pages.flatMap((page) => page.data);
  const selectedBrand = value
    ? brandsData.find((brand) => brand.id === value)
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <CommandTrigger
            suppressHydrationWarning
            aria-expanded={open}
            className={className}
            disabled={disabled}
          />
        }
      >
        {selectedBrand ? (
          <>
            <ImageWithFallback
              src={selectedBrand.logo?.url ?? ""}
              alt=""
              className="size-5 shrink-0 overflow-hidden rounded-sm border bg-white"
              width={20}
              height={20}
            />
            <span className="truncate">{selectedBrand.name}</span>
          </>
        ) : (
          <>
            <TargetIcon className="text-muted-foreground" />
            <span className="text-muted-foreground truncate">
              Select a brand
            </span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <BrandsCommand
          brands={brandsData}
          hasNextPage={hasNextPage}
          onValueChange={onValueChange}
          setOpen={setOpen}
          value={value}
          ref={ref}
        />

        <CommandFooter>
          <AddBrandDrawer />
        </CommandFooter>
      </PopoverContent>
    </Popover>
  );
}

export function BrandsCommand({
  brands,
  hasNextPage,
  onValueChange,
  setOpen,
  value,
  ref,
}: {
  brands: RouterOutput["admin"]["brands"]["queries"]["getPage"]["data"];
  value: number;
  onValueChange: (value: number) => void;
  setOpen: (open: boolean) => void;
  hasNextPage: boolean;
  ref: (node?: Element | null) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Search brands" />
      <CommandList>
        <CommandEmpty>No brands found</CommandEmpty>
        <CommandGroup>
          {brands.map((brand) => (
            <CommandItem
              key={brand.id}
              value={brand.name}
              data-checked={value === brand.id}
              onSelect={() => {
                onValueChange(brand.id === value ? 0 : brand.id);
                setOpen(false);
              }}
            >
              <div className="size-6 shrink-0 overflow-hidden rounded-sm border bg-white">
                <Image
                  src={brand.logo?.url ?? ""}
                  alt=""
                  className="size-full object-cover"
                  width={24}
                  height={24}
                />
              </div>
              <span className="flex-1 truncate">{brand.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <LoadMore ref={ref} hasNextPage={hasNextPage} />
      </CommandList>
    </Command>
  );
}
