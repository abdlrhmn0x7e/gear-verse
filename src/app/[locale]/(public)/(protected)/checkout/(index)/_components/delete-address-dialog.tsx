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
import { getCustomerErrorMessage } from "~/lib/utils/customer-error-message";
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
        toast.success("Address deleted");
      },
      onError: (error) => {
        toast.error(
          getCustomerErrorMessage(
            error,
            "Couldn't delete your address. Check your connection and try again.",
          ),
        );
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
            aria-label={`Delete address for ${address.fullName}`}
          />
        }
      >
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this address?</AlertDialogTitle>
          <AlertDialogDescription>
            <bdi>{address.fullName}</bdi>, <bdi>{address.address}</bdi>{" "}
            won&apos;t show at checkout anymore. Orders you&apos;ve already
            placed keep it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <XIcon data-icon="inline-start" />
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => deleteAddress({ id: address.id })}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete address
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
