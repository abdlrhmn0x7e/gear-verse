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
import { api } from "~/trpc/react";
import { useInView } from "react-intersection-observer";
import { Spinner } from "~/components/spinner";
import { AddBrandDialog } from "../dialogs/add-brand-dialog";
import { Separator } from "~/components/ui/separator";

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
  const {
    data: brands,
    isPending: brandsPending,
    isError: brandsError,
    fetchNextPage,
    hasNextPage,
  } = api.brands.getPage.useInfiniteQuery(
    {
      pageSize: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  React.useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (brandsPending) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="justify-between"
        disabled
      >
        <div className="flex items-center justify-start gap-2">
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
        <div className="flex items-center justify-start gap-2">
          <XCircleIcon size="small" />
          Error loading brands...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (!brands.pages) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="justify-between"
        disabled
      >
        <div className="flex items-center justify-start gap-2">
          <XCircleIcon size="small" />
          No brands found...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  const brandsData = brands.pages.flatMap((page) => page.data);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value ? (
            brandsData.find((brand) => brand.id === value)?.name
          ) : (
            <span className="text-muted-foreground">Select a brand</span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search brands" className="h-9" />
          <CommandList>
            <CommandEmpty>No brands found</CommandEmpty>
            <CommandGroup>
              {brandsData.map((brand) => (
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
                  <TargetIcon />
                  {brand.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === brand.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            {hasNextPage && (
              <div className="flex items-center justify-center p-4" ref={ref}>
                <Spinner />
              </div>
            )}
          </CommandList>

          <Separator />

          <AddBrandDialog />
        </Command>
      </PopoverContent>
    </Popover>
  );
}
