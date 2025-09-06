"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PackageIcon, XCircleIcon } from "lucide-react";

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
import Image from "next/image";

export function ProductsCombobox({
  value,
  onValueChange,
  disabled,
  className,
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const { ref, inView } = useInView();
  const {
    data: products,
    isPending: productsPending,
    isError: productsError,
    fetchNextPage,
    hasNextPage,
  } = api.products.getPage.useInfiniteQuery(
    {
      pageSize: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const productsData = React.useMemo(
    () => products?.pages.flatMap((page) => page.data) ?? [],
    [products],
  );

  React.useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (productsPending) {
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
          Loading products...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (productsError) {
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
          Error loading products...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (!products.pages) {
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
          No products found...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

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
          {value.length > 0 ? (
            productsData
              .filter((product) => value.includes(product.id))
              .map((product) => product.title)
              .join(", ")
          ) : (
            <div className="flex items-center gap-2">
              <PackageIcon className="text-muted-foreground size-4" />
              <span className="text-muted-foreground">Select products</span>
            </div>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <ProductsCommand
          products={products.pages.flatMap((page) => page.data)}
          hasNextPage={hasNextPage}
          onValueChange={onValueChange}
          value={value}
          ref={ref}
        />
      </PopoverContent>
    </Popover>
  );
}

export function ProductsCommand({
  products,
  hasNextPage,
  onValueChange,
  value,
  ref,
}: {
  products: RouterOutputs["products"]["getPage"]["data"];
  value: number[];
  onValueChange: (value: number[]) => void;
  hasNextPage: boolean;
  ref: (node?: Element | null) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Search products" className="h-9" />
      <CommandList>
        <CommandEmpty>No products found</CommandEmpty>
        <CommandGroup>
          {products.map((product) => (
            <CommandItem
              key={product.id}
              value={product.title}
              onSelect={() => {
                onValueChange(
                  value.includes(product.id)
                    ? value.filter((id) => id !== product.id)
                    : [...value, product.id],
                );
              }}
            >
              <div className="flex items-center gap-2">
                <div className="relative size-6 overflow-hidden rounded-sm border">
                  <Image
                    src={product.brand.logoUrl ?? ""}
                    alt={product.title}
                    className="size-full object-cover"
                    width={32}
                    height={32}
                  />
                </div>
                <p className="text-sm font-medium">{product.title}</p>
              </div>
              <Check
                className={cn(
                  "ml-auto",
                  value.includes(product.id) ? "opacity-100" : "opacity-0",
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
    </Command>
  );
}
