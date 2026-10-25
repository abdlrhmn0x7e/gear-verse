import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { Gamepad2Icon, XCircleIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { LoadMore } from "~/components/load-more";
import { Spinner } from "~/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Command,
  CommandEmpty,
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
import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/client";
import { Badge } from "~/components/ui/badge";

type ProductComboboxValue = {
  id: number;
  variantId: number | null;
};

/** What the trigger shows for an item */
export type ProductOption = {
  productId: number;
  productVariantId: number | null;
  title: string;
  thumbnailUrl: string | null;
  values: string[];
};

type InventoryItem = ProductOption & { id: number; quantity: number };

export function ProductsCombobox({
  value,
  onValueChange,
  selected,
  disabled,
  className,
  id,
  ariaInvalid,
}: {
  value: ProductComboboxValue;
  onValueChange: (value: ProductComboboxValue) => void;
  /** The item already on the order, shown until the list holds it; the list is paged, so it often doesn't */
  selected?: ProductOption | null;
  disabled?: boolean;
  className?: string;
  id?: string;
  ariaInvalid?: boolean;
}) {
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  // an item picked from a later page or a search stays shown after the list changes
  const [picked, setPicked] = useState<ProductOption | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { ref, inView } = useInView();
  const {
    data: items,
    isPending: itemsPending,
    isFetching: itemsFetching,
    isFetchingNextPage: itemsFetchingNextPage,
    isError: itemsError,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    trpc.admin.inventoryItems.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
        filters: {
          inventorySearch: debouncedSearch,
        },
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: keepPreviousData,
      },
    ),
  );
  // the inventory pages by product; an order line is one of its items
  const inventoryItemsData = useMemo<InventoryItem[]>(
    () =>
      items?.pages.flatMap((page) =>
        page.data.flatMap((product) =>
          product.items.map((item) => ({
            ...item,
            productId: product.id,
            title: product.title,
          })),
        ),
      ) ?? [],
    [items],
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (itemsPending) {
    return (
      <CommandTrigger id={id} className={className} disabled>
        <Spinner />
        <span className="text-muted-foreground truncate">Loading items</span>
      </CommandTrigger>
    );
  }

  if (itemsError) {
    return (
      <CommandTrigger id={id} className={className} aria-invalid disabled>
        <XCircleIcon className="text-destructive" />
        <span className="truncate">Couldn&apos;t load items</span>
      </CommandTrigger>
    );
  }

  function renderValue(value: ProductComboboxValue) {
    const item = [...inventoryItemsData, picked, selected].find(
      (item) =>
        item?.productId === value.id &&
        (item.productVariantId ?? null) === value.variantId,
    );

    if (!value || !item) {
      return (
        <>
          <Gamepad2Icon className="text-muted-foreground" />
          <span className="text-muted-foreground truncate">Select an item</span>
        </>
      );
    }

    return (
      <>
        <Avatar className="size-5">
          <AvatarImage src={item?.thumbnailUrl ?? ""} alt="" />
          <AvatarFallback>{item?.title?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="truncate">
          {item?.title}{" "}
          {item.values.length > 0 ? `· ${item.values.join(", ")}` : ""}
        </span>
      </>
    );
  }

  function handleValueChange(value: ProductComboboxValue, item: InventoryItem) {
    setPicked(item);
    onValueChange(value);

    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger
        render={
          <CommandTrigger
            id={id}
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            className={className}
            disabled={disabled}
          />
        }
      >
        {renderValue(value)}
      </PopoverTrigger>
      <PopoverContent>
        <ProductsCommand
          items={inventoryItemsData}
          search={search}
          setSearch={setSearch}
          isSearching={itemsFetching && !itemsFetchingNextPage}
          hasNextPage={hasNextPage}
          onValueChange={handleValueChange}
          setOpen={setOpen}
          value={value ?? 0}
          ref={ref}
        />
      </PopoverContent>
    </Popover>
  );
}

export function ProductsCommand({
  items,
  hasNextPage,
  isSearching,
  search,
  setSearch,
  onValueChange,
  setOpen,
  value,
  ref,
}: {
  items: InventoryItem[];
  search: string;
  setSearch: (search: string) => void;
  value: ProductComboboxValue;
  onValueChange: (value: ProductComboboxValue, item: InventoryItem) => void;
  isSearching: boolean;
  setOpen: (open: boolean) => void;
  hasNextPage: boolean;
  ref: (node?: Element | null) => void;
}) {
  return (
    // the server searches the inventory (SKU included), so cmdk's own matching on the title stays off
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search items"
        value={search}
        onValueChange={setSearch}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />

      <CommandList>
        {!isSearching ? (
          <>
            <CommandEmpty>No items found</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.productId}-${item.productVariantId}-${item.title}`}
                  data-checked={
                    value.id === item.productId &&
                    value.variantId === item.productVariantId
                  }
                  onSelect={() => {
                    if (
                      item.productId === value.id &&
                      item.productVariantId === value.variantId
                    ) {
                      setOpen(false);
                      return;
                    }

                    onValueChange(
                      {
                        id: item.productId,
                        variantId: item.productVariantId ?? null,
                      },
                      item,
                    );
                    setOpen(false);
                  }}
                >
                  <Avatar className="size-8">
                    <AvatarImage src={item.thumbnailUrl ?? ""} alt="" />
                    <AvatarFallback>{item.title?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="truncate">
                      {item.title}
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {item.quantity} available
                      </span>
                    </p>
                    {item.values.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {item.values.map((value) => (
                          <Badge key={value} variant="outline">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : (
          <div className="flex items-center justify-center py-6">
            <Spinner />
          </div>
        )}

        {!isSearching && <LoadMore ref={ref} hasNextPage={hasNextPage} />}
      </CommandList>
    </Command>
  );
}
