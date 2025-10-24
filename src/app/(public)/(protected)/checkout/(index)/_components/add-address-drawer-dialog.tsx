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
import { AddressForm, type AddressFormValues } from "./address-form";
import { Button } from "~/components/ui/button";
import { IconHomePlus } from "@tabler/icons-react";
import { useTRPC } from "~/trpc/client";
import { useState, type PropsWithChildren } from "react";
import { Spinner } from "~/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Add Address</DrawerDialogTitle>
        </DrawerDialogHeader>

        <DrawerDialogBody>
          <AddressForm onSubmit={onSubmit} />
        </DrawerDialogBody>

        <DrawerDialogFooter>
          <Button type="submit" form="address-form" disabled={isAddingAddress}>
            {isAddingAddress ? <Spinner /> : <IconHomePlus />}
            Add Address
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
