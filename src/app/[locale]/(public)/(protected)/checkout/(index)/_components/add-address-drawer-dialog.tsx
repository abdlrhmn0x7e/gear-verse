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
import { useState, type ReactElement } from "react";
import { Spinner } from "~/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "~/components/ui/toast";
import { useCustomerErrorMessage } from "~/lib/utils/customer-error-message";
import { useTranslations } from "next-intl";

function useAddAddress(onSuccess: (id: number) => void) {
  const t = useTranslations("checkout.addAddress");
  const getErrorMessage = useCustomerErrorMessage();
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
        toast.error(getErrorMessage(error, t("error")));
      },
    }),
  );
}

function SaveAddressButton({ pending }: { pending: boolean }) {
  const t = useTranslations("checkout.addAddress");

  return (
    <Button type="submit" form="address-form" disabled={pending}>
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <IconHomePlus data-icon="inline-start" />
      )}
      {t("save")}
    </Button>
  );
}

export function AddAddressDrawerDialog({
  children,
  onSuccess,
  className,
}: {
  children: ReactElement;
  className?: string;
  onSuccess?: (id: number) => void;
}) {
  const t = useTranslations("checkout.addAddress");
  const [open, setOpen] = useState(false);
  const { mutate: addAddress, isPending } = useAddAddress((id) => {
    onSuccess?.(id);
    setOpen(false);
    toast.success(t("added"));
  });

  function onSubmit(values: AddressFormValues) {
    addAddress(values);
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger className={className} render={children} />

      {/* the map makes the form taller than a laptop screen, so the dialog
          scrolls its body between a fixed header and footer */}
      <DrawerDialogContent className="md:max-h-[calc(100dvh-2rem)] md:grid-rows-[auto_minmax(0,1fr)_auto]">
        <DrawerDialogHeader>
          <DrawerDialogTitle>{t("title")}</DrawerDialogTitle>
        </DrawerDialogHeader>

        <DrawerDialogBody className="md:-mx-6 md:-my-1 md:min-h-0 md:overflow-y-auto md:px-6 md:py-1">
          <AddressForm onSubmit={onSubmit} />
        </DrawerDialogBody>

        <DrawerDialogFooter>
          <SaveAddressButton pending={isPending} />
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
