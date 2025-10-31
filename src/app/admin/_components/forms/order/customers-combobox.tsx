import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useInView } from "react-intersection-observer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Check,
  ChevronsUpDown,
  SearchIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import { Separator } from "~/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { LoadMore } from "~/components/load-more";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Spinner } from "~/components/spinner";
import { AddCustomerDialog } from "../../dialogs/add-customer";
import { useDebounce } from "~/hooks/use-debounce";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";

export function CustomersCombobox({
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
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { ref, inView } = useInView();
  const {
    data: customers,
    isPending: customersPending,
    isFetching: customersFetching,
    isFetchingNextPage: customersFetchingNextPage,
    isError: customersError,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    trpc.admin.users.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
        filters: {
          name: debouncedSearch,
        },
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: keepPreviousData,
      },
    ),
  );
  const customersData = useMemo(
    () => customers?.pages.flatMap((page) => page.data) ?? [],
    [customers],
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (customersPending) {
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
          Loading customers...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (customersError) {
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
          Error loading customers
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  function renderValue(value: number | null) {
    const customer = customersData.find((customer) => customer.id === value);

    if (!value || !customer) {
      return (
        <div className="flex items-center gap-2">
          <UserIcon className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">Select a customer</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarImage src={customer?.image ?? ""} alt={customer?.name ?? ""} />
          <AvatarFallback>{customer?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        {customer?.name}
      </div>
    );
  }

  function handleValueChange(value: number) {
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
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {renderValue(value)}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <CustomersCommand
          customers={customersData}
          search={search}
          setSearch={setSearch}
          isSearching={customersFetching && !customersFetchingNextPage}
          hasNextPage={hasNextPage}
          onValueChange={handleValueChange}
          setOpen={setOpen}
          value={value ?? 0}
          ref={ref}
        />

        <Separator />

        <AddCustomerDialog />
      </PopoverContent>
    </Popover>
  );
}

export function CustomersCommand({
  customers,
  hasNextPage,
  isSearching,
  search,
  setSearch,
  onValueChange,
  setOpen,
  value,
  ref,
}: {
  customers: RouterOutput["admin"]["users"]["queries"]["getPage"]["data"];
  search: string;
  setSearch: (search: string) => void;
  value: number;
  onValueChange: (value: number) => void;
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
            placeholder="Search customers"
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
            <CommandEmpty>No customers found</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={`${customer.id}-${customer.name}`}
                  onSelect={() => {
                    if (customer.id === value) {
                      onValueChange(0);
                      setOpen(false);
                      return;
                    }

                    onValueChange(customer.id);
                    setOpen(false);
                  }}
                >
                  <Avatar>
                    <AvatarImage
                      src={customer.image ?? ""}
                      alt={customer.name}
                    />
                    <AvatarFallback>{customer.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {customer.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === customer.id ? "opacity-100" : "opacity-0",
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
