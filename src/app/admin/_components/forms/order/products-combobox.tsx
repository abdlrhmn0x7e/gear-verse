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
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { Badge } from "~/components/ui/badge";

type ProductComboboxValue = {
  id: number;
  variantId: number | null;
};

export function ProductsCombobox({
  value,
  onValueChange,
  disabled,
  className,
  ariaInvalid,
}: {
  value: ProductComboboxValue;
  onValueChange: (value: ProductComboboxValue) => void;
  disabled?: boolean;
  className?: string;
  ariaInvalid?: boolean;
}) {
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
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
  const inventoryItemsData = useMemo(
    () => items?.pages.flatMap((page) => page.data) ?? [],
    [items],
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (itemsPending) {
    return (
      <CommandTrigger className={className} disabled>
        <Spinner />
        <span className="text-muted-foreground truncate">Loading items</span>
      </CommandTrigger>
    );
  }

  if (itemsError) {
    return (
      <CommandTrigger className={className} aria-invalid disabled>
        <XCircleIcon className="text-destructive" />
        <span className="truncate">Couldn&apos;t load items</span>
      </CommandTrigger>
    );
  }

  function renderValue(value: ProductComboboxValue) {
    const item = inventoryItemsData.find(
      (item) =>
        item.productId === value.id &&
        item.productVariantId === value.variantId,
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

  function handleValueChange(value: { id: number; variantId: number | null }) {
    onValueChange(value);

    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger
        render={
          <CommandTrigger
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
  items: RouterOutput["admin"]["inventoryItems"]["queries"]["getPage"]["data"];
  search: string;
  setSearch: (search: string) => void;
  value: ProductComboboxValue;
  onValueChange: (value: ProductComboboxValue) => void;
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

                    onValueChange({
                      id: item.productId,
                      variantId: item.productVariantId ?? null,
                    });
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
