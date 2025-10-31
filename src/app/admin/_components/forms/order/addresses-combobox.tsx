import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Check, ChevronsUpDown, UserIcon, XCircleIcon } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Spinner } from "~/components/spinner";
import { AddAddressDialog } from "../../dialogs/add-address";
import { IconHome, IconHomeOff, IconPhone } from "@tabler/icons-react";
import { humanizeString } from "~/lib/utils/humanize-string";
import { Badge } from "~/components/ui/badge";

export function AddressesCombobox({
  userId,
  value,
  onValueChange,
  disabled,
  className,
}: {
  userId: number | null;
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const {
    data: addresses,
    isPending: addressesPending,
    isError: addressesError,
  } = useQuery(
    trpc.admin.addresses.queries.findByUserId.queryOptions(
      {
        userId: userId ?? 0,
      },
      {
        enabled: !!userId,
      },
    ),
  );

  if (!addresses) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", className)}
        disabled={true}
      >
        <div className="flex items-center gap-2">
          <IconHomeOff />
          Please select a customer first
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (addressesPending) {
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
          Loading addresses...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (addressesError) {
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
          Error loading addresses
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  function renderValue(value: number | null) {
    const address = addresses?.find((address) => address.id === value);
    if (!value || !address) {
      return (
        <div className="flex items-center gap-2">
          <UserIcon className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">Select an address</span>
        </div>
      );
    }

    return (
      <div className="flex max-w-3/4 items-center gap-1">
        <IconHome />
        <span className="line-clamp-1 flex-1 truncate text-sm capitalize">
          {address.governorate.toLowerCase()}, {address.city} -{" "}
          {address.address}, {address.buildingNameOrNumber}
        </span>
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
        <AddressesCommand
          addresses={addresses}
          onValueChange={handleValueChange}
          setOpen={setOpen}
          value={value ?? 0}
        />

        <Separator />

        <AddAddressDialog userId={userId ?? 0} />
      </PopoverContent>
    </Popover>
  );
}

export function AddressesCommand({
  addresses,
  onValueChange,
  setOpen,
  value,
}: {
  addresses: RouterOutput["admin"]["addresses"]["queries"]["findByUserId"];
  value: number;
  onValueChange: (value: number) => void;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Search addresses" className="h-9" />
      <CommandList>
        <CommandEmpty>No addresses found</CommandEmpty>
        <CommandGroup>
          {addresses.map((address) => (
            <CommandItem
              key={address.id}
              value={`${address.fullName}-${address.city}-${address.governorate}-${address.address}`}
              onSelect={() => {
                if (address.id === value) {
                  setOpen(false);
                  return;
                }

                onValueChange(address.id);
                setOpen(false);
              }}
            >
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <IconHome className="size-5" />
                  <span className="text-sm capitalize">
                    {address.governorate.toLowerCase()}, {address.city} -{" "}
                    {address.address}
                  </span>
                </div>
                <Badge variant="outline" className="h-fit px-2">
                  <IconPhone />
                  <span className="text-sm capitalize">
                    {address.phoneNumber}
                  </span>
                </Badge>
              </div>
              <Check
                className={cn(
                  "ml-auto",
                  value === address.id ? "opacity-100" : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
