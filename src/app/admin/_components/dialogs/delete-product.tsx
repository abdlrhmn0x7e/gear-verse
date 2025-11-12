"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useTRPC } from "~/trpc/client";

export function DeleteProductDialog({
  id,
  showText = true,
  onDeleteSuccess,
  Trigger,
  ...props
}: {
  id: number;
  showText?: boolean;
  onDeleteSuccess?: () => void;
  Trigger?: React.ReactNode;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: deleteProduct, isPending } = useMutation(
    trpc.admin.products.mutations.delete.mutationOptions(),
  );

  function handleDelete() {
    deleteProduct(
      { id },
      {
        onSuccess: () => {
          onDeleteSuccess?.();
          void queryClient.invalidateQueries({
            queryKey: trpc.admin.products.queries.getPage.queryKey(),
          });
        },
      },
    );
  }

  return (
    <AlertDialog {...props}>
      {Trigger && <AlertDialogTrigger asChild>{Trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleDelete}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
