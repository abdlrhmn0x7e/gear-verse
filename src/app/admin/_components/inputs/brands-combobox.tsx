"use client";

import * as React from "react";
import { Check, ChevronsUpDown, TargetIcon, XCircleIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useInView } from "react-intersection-observer";
import { Spinner } from "~/components/spinner";
import { Separator } from "~/components/ui/separator";
import Image from "next/image";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { LoadMore } from "~/components/load-more";
import { AddBrandDrawer } from "../drawers/add-brand";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";

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

  if (!brands) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={false}
        className={cn("w-full justify-between", className)}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <TargetIcon className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">Select a brand</span>
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (brandsPending) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="justify-between"
        disabled
      >
        <div className="flex items-center gap-2">
          <Spinner size="small" />
          Loading brands...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (brandsError) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="justify-between"
        disabled
      >
        <div className="flex items-center gap-2">
          <XCircleIcon size="small" />
          Error loading brands...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (!brands.pages) {
    return (
      <Button variant="outline" role="combobox" aria-expanded={open} disabled>
        <div className="flex items-center gap-2">
          <XCircleIcon size="small" />
          No brands found...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  function renderValue(value: number) {
    const brand = brandsData.find((brand) => brand.id === value);

    return (
      <div className="flex items-center gap-2">
        <ImageWithFallback
          src={brand?.logo?.url ?? ""}
          alt={brand?.name ?? ""}
          className="size-6 overflow-hidden rounded-sm border"
          width={24}
          height={24}
        />

        <span>{brand?.name}</span>
      </div>
    );
  }

  const brandsData = brands.pages.flatMap((page) => page.data);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          suppressHydrationWarning
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value ? (
            renderValue(value)
          ) : (
            <div className="flex items-center gap-2">
              <TargetIcon className="text-muted-foreground size-4" />
              <span className="text-muted-foreground">Select a brand</span>
            </div>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <BrandsCommand
          brands={brands.pages.flatMap((page) => page.data)}
          hasNextPage={hasNextPage}
          onValueChange={onValueChange}
          setOpen={setOpen}
          value={value}
          ref={ref}
        />

        <Separator />

        <AddBrandDrawer />
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
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: deleteBrand, isPending: deletingBrand } = useMutation(
    trpc.admin.brands.mutations.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.brands.queries.getPage.infiniteQueryFilter(),
        );
      },
      onError: () => {
        toast.error(
          "This brand is associated with other products you can't delete it",
        );
      },
    }),
  );

  return (
    <Command>
      <CommandInput placeholder="Search brands" className="h-9" />
      <CommandList>
        <CommandEmpty>No brands found</CommandEmpty>
        <CommandGroup>
          {brands.map((brand) => (
            <CommandItem
              key={brand.id}
              value={brand.name}
              onSelect={() => {
                if (brand.id === value) {
                  onValueChange(0);
                  setOpen(false);
                  return;
                }

                onValueChange(brand.id);
                setOpen(false);
              }}
            >
              <div className="bg-muted size-6 overflow-hidden rounded-sm border">
                <Image
                  src={brand.logo?.url ?? ""}
                  alt={brand.name}
                  className="size-full object-cover"
                  width={24}
                  height={24}
                />
              </div>
              {brand.name}
              <Check
                className={cn(
                  "ml-auto",
                  value === brand.id ? "opacity-100" : "opacity-0",
                )}
              />
              <Button
                size="icon"
                variant="destructive-ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBrand({ brandId: brand.id });
                }}
                disabled={deletingBrand}
              >
                <IconTrash />
              </Button>
            </CommandItem>
          ))}
        </CommandGroup>

        <LoadMore ref={ref} hasNextPage={hasNextPage} />
      </CommandList>
    </Command>
  );
}
