"use client";

import { Trash2Icon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  onDeleteSuccess,
  Trigger,
  ...props
}: {
  id: number;
  onDeleteSuccess?: () => void;
  Trigger?: React.ReactNode;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: deleteProduct, isPending } = useMutation(
    trpc.admin.products.mutations.delete.mutationOptions(),
  );

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    deleteProduct(
      { id },
      {
        onSuccess: () => {
          onDeleteSuccess?.();
          void queryClient.invalidateQueries(
            trpc.admin.products.queries.getPage.infiniteQueryFilter(),
          );
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
          <AlertDialogCancel>
            <XIcon data-icon="inline-start" />
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete product
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
