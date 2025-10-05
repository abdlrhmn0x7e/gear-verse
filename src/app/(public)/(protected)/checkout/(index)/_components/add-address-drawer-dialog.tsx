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
import { api } from "~/trpc/react";
import { useState, type PropsWithChildren } from "react";
import { Spinner } from "~/components/spinner";

export function AddAddressDrawerDialog({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const { mutate: addAddress, isPending: isAddingAddress } =
    api.public.checkout.mutations.addAddress.useMutation({
      onSuccess: () => {
        void utils.public.checkout.queries.getAddresses.invalidate();
        setOpen(false);
      },
    });

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
