"use client";

import {
  DrawerDialog,
  DrawerDialogBody,
  DrawerDialogContent,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";
import {
  AddressForm,
  type AddressFormValues,
} from "~/components/forms/address-form";
import { Button } from "~/components/ui/button";
import { IconHomePlus } from "@tabler/icons-react";
import { useTRPC } from "~/trpc/client";
import { useState, type PropsWithChildren } from "react";
import { Spinner } from "~/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "~/components/ui/toast";
import { getCustomerErrorMessage } from "~/lib/utils/customer-error-message";

export function AddAddressDrawerDialog({
  children,
  onSuccess,
  className,
}: PropsWithChildren<{
  className?: string;
  onSuccess?: (id: number) => void;
}>) {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: addAddress, isPending: isAddingAddress } = useMutation(
    trpc.public.checkout.mutations.addAddress.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries(
          trpc.public.checkout.queries.getAddresses.queryFilter(),
        );
        onSuccess?.(data.id);
        setOpen(false);
        toast.success("Address added");
      },
      onError: (error) => {
        toast.error(
          getCustomerErrorMessage(
            error,
            "We couldn't save this address. Please try again.",
          ),
        );
      },
    }),
  );

  function onSubmit(values: AddressFormValues) {
    addAddress(values);
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger className={className} asChild>
        {children}
      </DrawerDialogTrigger>

      {/* the map makes the form taller than a laptop screen, so the dialog
          scrolls its body between a fixed header and footer */}
      <DrawerDialogContent className="md:max-h-[calc(100dvh-2rem)] md:grid-rows-[auto_minmax(0,1fr)_auto]">
        <DrawerDialogHeader>
          <DrawerDialogTitle>Add address</DrawerDialogTitle>
        </DrawerDialogHeader>

        <DrawerDialogBody className="md:-mx-6 md:-my-1 md:min-h-0 md:overflow-y-auto md:px-6 md:py-1">
          <AddressForm onSubmit={onSubmit} />
        </DrawerDialogBody>

        <DrawerDialogFooter>
          <Button type="submit" form="address-form" disabled={isAddingAddress}>
            {isAddingAddress ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconHomePlus data-icon="inline-start" />
            )}
            Add address
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
