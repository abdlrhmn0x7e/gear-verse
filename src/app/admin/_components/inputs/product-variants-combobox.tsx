"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  CircleDashedIcon,
  XCircleIcon,
} from "lucide-react";

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
import { api, type RouterOutputs } from "~/trpc/react";
import { useInView } from "react-intersection-observer";
import { Spinner } from "~/components/spinner";
import { LoadMore } from "~/components/load-more";
import { useDebounce } from "~/hooks/use-debounce";
import { keepPreviousData } from "@tanstack/react-query";
import { ImageWithFallback } from "~/components/image-with-fallback";

export function ProductVariantsCombobox({
  value,
  onValueChange,
  disabled,
  className,
  isModal = false,
}: {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  isModal?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { ref, inView } = useInView();
  const {
    data: variants,
    isPending: variantsPending,
    isError: variantsError,
    fetchNextPage,
    hasNextPage,
  } = api.admin.productVariants.getPage.useInfiniteQuery(
    {
      pageSize: 10,
      filters: {
        search: debouncedSearch,
      },
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: keepPreviousData,
    },
  );

  React.useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (variantsPending) {
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
          Loading variants...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (variantsError) {
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
          Error loading variants...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (!variants.pages) {
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
          No variants found...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }
  const variantsData = variants.pages.flatMap((page) => page.data);

  function renderValue(value: number) {
    const variant = variantsData.find((variant) => variant.id === value);
    if (!variant) {
      return;
    }

    return (
      <div className="flex items-center gap-2">
        <ImageWithFallback
          src={variant.thumbnail?.url ?? ""}
          alt={variant.name}
          className="size-6 overflow-hidden rounded-sm border"
          width={24}
          height={24}
        />

        <span className="max-w-48 truncate">{`${variant.product?.name ?? "Unknown Product"} - ${variant.name}`}</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={isModal}>
      <PopoverTrigger asChild>
        <Button
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
              <CircleDashedIcon className="text-muted-foreground size-4" />
              <span className="text-muted-foreground">Select a variant</span>
            </div>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <VariantsCommand
          variants={variantsData}
          hasNextPage={hasNextPage}
          onValueChange={onValueChange}
          setOpen={setOpen}
          value={value}
          ref={ref}
          search={search}
          setSearch={setSearch}
        />
      </PopoverContent>
    </Popover>
  );
}

export function VariantsCommand({
  variants,
  hasNextPage,
  onValueChange,
  setOpen,
  search,
  setSearch,
  value,
  ref,
}: {
  variants: RouterOutputs["admin"]["productVariants"]["getPage"]["data"];
  value: number;
  onValueChange: (value: number) => void;
  setOpen: (open: boolean) => void;
  hasNextPage: boolean;
  search: string;
  setSearch: (search: string) => void;
  ref: (node?: Element | null) => void;
}) {
  return (
    <Command>
      <CommandInput
        placeholder="Search variants"
        className="h-9"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No variants found</CommandEmpty>
        <CommandGroup>
          {variants.map((variant) => (
            <CommandItem
              key={variant.id}
              value={variant.name}
              onSelect={() => {
                if (variant.id === value) {
                  onValueChange(0);
                  setOpen(false);
                  return;
                }

                onValueChange(variant.id);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={variant.thumbnail?.url ?? ""}
                  alt={variant.name}
                  className="size-12 shrink-0 overflow-hidden border"
                  width={48}
                  height={48}
                />
                <span>{`${variant.product?.name ?? "Unknown Product"} - ${variant.name}`}</span>
              </div>
              <Check
                className={cn(
                  "ml-auto",
                  value === variant.id ? "opacity-100" : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>

        <LoadMore ref={ref} hasNextPage={hasNextPage} />
      </CommandList>
    </Command>
  );
}
