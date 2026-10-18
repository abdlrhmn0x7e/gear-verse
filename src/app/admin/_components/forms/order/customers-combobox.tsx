import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useInView } from "react-intersection-observer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { UserIcon, XCircleIcon } from "lucide-react";
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
import { LoadMore } from "~/components/load-more";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Spinner } from "~/components/spinner";
import { AddCustomerDialog } from "../../dialogs/add-customer";
import { useDebounce } from "~/hooks/use-debounce";

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
      <CommandTrigger className={className} disabled>
        <Spinner />
        <span className="text-muted-foreground truncate">
          Loading customers
        </span>
      </CommandTrigger>
    );
  }

  if (customersError) {
    return (
      <CommandTrigger className={className} aria-invalid disabled>
        <XCircleIcon className="text-destructive" />
        <span className="truncate">Couldn&apos;t load customers</span>
      </CommandTrigger>
    );
  }

  function renderValue(value: number | null) {
    const customer = customersData.find((customer) => customer.id === value);

    if (!value || !customer) {
      return (
        <>
          <UserIcon className="text-muted-foreground" />
          <span className="text-muted-foreground truncate">
            Select a customer
          </span>
        </>
      );
    }

    return (
      <>
        <Avatar className="size-5">
          <AvatarImage src={customer?.image ?? ""} alt="" />
          <AvatarFallback>{customer?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="truncate">{customer?.name}</span>
      </>
    );
  }

  function handleValueChange(value: number) {
    onValueChange(value);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <CommandTrigger
          aria-expanded={open}
          className={className}
          disabled={disabled}
        >
          {renderValue(value)}
        </CommandTrigger>
      </PopoverTrigger>
      <PopoverContent>
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

        <CommandFooter>
          <AddCustomerDialog />
        </CommandFooter>
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
  return (
    // the server filters by name, so cmdk's own matching stays off
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search customers"
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
            <CommandEmpty>No customers found</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={`${customer.id}-${customer.name}`}
                  data-checked={value === customer.id}
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
                  <Avatar className="size-6">
                    <AvatarImage src={customer.image ?? ""} alt="" />
                    <AvatarFallback>{customer.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{customer.name}</span>
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
