import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  Gamepad2Icon,
  SearchIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { LoadMore } from "~/components/load-more";
import { Spinner } from "~/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useDebounce } from "~/hooks/use-debounce";
import { cn } from "~/lib/utils";
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
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", className)}
        disabled={true}
      >
        <div className="flex items-center gap-2">
          <Spinner />
          Loading items...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (itemsError) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-invalid={true}
        className={cn(
          "text-destructive border-destructive w-full justify-between",
          className,
        )}
        disabled={true}
      >
        <div className="flex items-center gap-2">
          <XCircleIcon size="small" />
          Error loading items
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
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
        <div className="flex items-center gap-2">
          <Gamepad2Icon className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">Select an item</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarImage src={item?.thumbnailUrl ?? ""} alt={item?.title ?? ""} />
          <AvatarFallback>{item?.title?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="truncate">
          {item?.title}{" "}
          {item.values.length > 0 ? `– ${item.values.join(", ")}` : ""}
        </span>
      </div>
    );
  }

  function handleValueChange(value: { id: number; variantId: number | null }) {
    onValueChange(value);

    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className={cn(
            "aria-invalid:border-destructive/64 aria-invalid:text-destructive w-full justify-between",
            className,
          )}
          disabled={disabled}
        >
          {renderValue(value)}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
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
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  return (
    <Command>
      <div className="p-1">
        <InputGroup className="has-focus-visible:border-border rounded-sm has-focus-visible:ring-0">
          <InputGroupInput
            placeholder="Search items"
            onChange={handleSearch}
            value={search}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <CommandList>
        {!isSearching ? (
          <>
            <CommandEmpty>No items found</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.productId}-${item.productVariantId}-${item.title}`}
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
                  <Avatar>
                    <AvatarImage
                      src={item.thumbnailUrl ?? ""}
                      alt={item.title}
                    />
                    <AvatarFallback>{item.title?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <p>
                      {item.title} - {item.quantity} Available
                    </p>
                    <div className="flex items-center gap-1">
                      {item.values.map((value) => (
                        <Badge key={value} variant="outline">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      value.id === item.productId &&
                        value.variantId === item.productVariantId
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
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
