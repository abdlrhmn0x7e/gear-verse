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

function useAddAddress(onSuccess: (id: number) => void) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.public.checkout.mutations.addAddress.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries(
          trpc.public.checkout.queries.getAddresses.queryFilter(),
        );
        onSuccess(data.id);
      },
      onError: (error) => {
        toast.error(
          getCustomerErrorMessage(
            error,
            "Couldn't save your address. Check your connection and try again.",
          ),
        );
      },
    }),
  );
}

function SaveAddressButton({
  pending,
  className,
}: {
  pending: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      form="address-form"
      disabled={pending}
      className={className}
    >
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <IconHomePlus data-icon="inline-start" />
      )}
      Save address
    </Button>
  );
}

/** For a customer with no saved address: the form sits in the checkout itself, one step fewer than a drawer. */
export function AddAddressInline({
  onSuccess,
}: {
  onSuccess: (id: number) => void;
}) {
  const { mutate: addAddress, isPending } = useAddAddress(onSuccess);

  return (
    <div className="bg-card space-y-6 rounded-3xl p-5 sm:p-6">
      <AddressForm onSubmit={(values) => addAddress(values)} />
      <SaveAddressButton
        pending={isPending}
        className="w-full sm:w-fit pointer-coarse:h-11"
      />
    </div>
  );
}

export function AddAddressDrawerDialog({
  children,
  onSuccess,
  className,
}: PropsWithChildren<{
  className?: string;
  onSuccess?: (id: number) => void;
}>) {
  const [open, setOpen] = useState(false);
  const { mutate: addAddress, isPending } = useAddAddress((id) => {
    onSuccess?.(id);
    setOpen(false);
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
          <DrawerDialogTitle>Add address</DrawerDialogTitle>
        </DrawerDialogHeader>

        <DrawerDialogBody>
          <AddressForm onSubmit={onSubmit} />
        </DrawerDialogBody>

        <DrawerDialogFooter>
          <SaveAddressButton pending={isPending} />
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
