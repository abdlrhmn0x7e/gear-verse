import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC, type RouterOutput } from "~/trpc/client";
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
import { Spinner } from "~/components/spinner";
import { AddAddressDialog } from "../../dialogs/add-address";
import { IconHome, IconHomeOff, IconPhone } from "@tabler/icons-react";

export function AddressesCombobox({
  userId,
  value,
  onValueChange,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: {
  userId: number | null;
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
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

  if (!userId) {
    return (
      <CommandTrigger id={id} className={className} disabled>
        <IconHomeOff className="text-muted-foreground" />
        <span className="text-muted-foreground truncate">
          Select a customer first
        </span>
      </CommandTrigger>
    );
  }

  if (addressesError) {
    return (
      <CommandTrigger id={id} className={className} aria-invalid disabled>
        <XCircleIcon className="text-destructive" />
        <span className="truncate">Couldn&apos;t load addresses</span>
      </CommandTrigger>
    );
  }

  if (addressesPending || !addresses) {
    return (
      <CommandTrigger id={id} className={className} disabled>
        <Spinner />
        <span className="text-muted-foreground truncate">
          Loading addresses
        </span>
      </CommandTrigger>
    );
  }

  function renderValue(value: number | null) {
    const address = addresses?.find((address) => address.id === value);
    if (!value || !address) {
      return (
        <>
          <UserIcon className="text-muted-foreground" />
          <span className="text-muted-foreground truncate">
            Select an address
          </span>
        </>
      );
    }

    return (
      <>
        <IconHome />
        <span className="truncate capitalize">
          {address.governorate.toLowerCase()}, {address.city} -{" "}
          {address.address}, {address.buildingNameOrNumber}
        </span>
      </>
    );
  }

  function handleValueChange(value: number) {
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
        <AddressesCommand
          addresses={addresses}
          onValueChange={handleValueChange}
          setOpen={setOpen}
          value={value ?? 0}
        />

        <CommandFooter>
          <AddAddressDialog userId={userId} />
        </CommandFooter>
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
      <CommandInput placeholder="Search addresses" />
      <CommandList>
        <CommandEmpty>No addresses found</CommandEmpty>
        <CommandGroup>
          {addresses.map((address) => (
            <CommandItem
              key={address.id}
              value={`${address.fullName}-${address.city}-${address.governorate}-${address.address}`}
              data-checked={value === address.id}
              onSelect={() => {
                if (address.id === value) {
                  setOpen(false);
                  return;
                }

                onValueChange(address.id);
                setOpen(false);
              }}
            >
              <IconHome className="text-muted-foreground" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate capitalize">
                  {address.governorate.toLowerCase()}, {address.city} -{" "}
                  {address.address}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs font-normal">
                  <IconPhone className="size-3" />
                  {address.phoneNumber}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
