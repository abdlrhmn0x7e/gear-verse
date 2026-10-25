"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon, XIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";
import { useCustomerErrorMessage } from "~/lib/utils/customer-error-message";
import { useTranslations } from "next-intl";
import { useTRPC } from "~/trpc/client";

export function DeleteAddressDialog({
  address,
  onDeleted,
  className,
}: {
  address: { id: number; fullName: string; address: string };
  onDeleted: (id: number) => void;
  className?: string;
}) {
  const t = useTranslations("checkout.deleteAddress");
  const getErrorMessage = useCustomerErrorMessage();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: deleteAddress, isPending } = useMutation(
    trpc.public.checkout.mutations.deleteAddress.mutationOptions({
      onSuccess: () => {
        onDeleted(address.id);
        queryClient.setQueryData(
          trpc.public.checkout.queries.getAddresses.queryKey(),
          (addresses) => addresses?.filter(({ id }) => id !== address.id),
        );
        void queryClient.invalidateQueries(
          trpc.public.checkout.queries.getAddresses.queryFilter(),
        );
        toast.success(t("deleted"));
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, t("error")));
      },
    }),
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isPending}
        render={
          <Button
            type="button"
            variant="destructive-ghost"
            size="icon-sm"
            className={className}
            aria-label={t("label", { name: address.fullName })}
          />
        }
      >
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.rich("description", {
              name: () => <bdi>{address.fullName}</bdi>,
              address: () => <bdi>{address.address}</bdi>,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <XIcon data-icon="inline-start" />
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => deleteAddress({ id: address.id })}
          >
            <Trash2Icon data-icon="inline-start" />
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
