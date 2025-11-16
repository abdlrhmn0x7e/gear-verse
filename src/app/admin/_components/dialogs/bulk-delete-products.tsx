"use client";

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

type BulkDeleteProductsDialogProps = React.ComponentProps<typeof AlertDialog> & {
  ids: number[];
  Trigger: React.ReactNode;
  onDeleteSuccess?: (deletedIds: number[]) => void;
};

export function BulkDeleteProductsDialog({
  ids,
  Trigger,
  onDeleteSuccess,
  ...props
}: BulkDeleteProductsDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: bulkDeleteProducts, isPending } = useMutation(
    trpc.admin.products.mutations.bulkDelete.mutationOptions(),
  );

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    bulkDeleteProducts(
      { ids },
      {
        onSuccess: (deletedProducts) => {
          const deletedIds = deletedProducts?.map((product) => product.id) ?? [];
          toast.success(
            deletedIds.length === 1
              ? "Deleted 1 product"
              : `Deleted ${deletedIds.length} products`,
          );
          onDeleteSuccess?.(deletedIds);
          void queryClient.invalidateQueries(
            trpc.admin.products.queries.getPage.infiniteQueryFilter(),
          );
        },
      },
    );
  }

  return (
    <AlertDialog {...props}>
      <AlertDialogTrigger asChild>{Trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete selected products?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            {ids.length === 1 ? "the selected product" : `${ids.length} products`} and
            remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={ids.length === 0 || isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

