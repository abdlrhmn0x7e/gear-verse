"use client";

import { TrashIcon } from "lucide-react";
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
import { api } from "~/trpc/react";

export function DeleteProductDialog({
  id,
  showText = true,
  variant = "destructive",
  size = "default",
  className,
  onDeleteSuccess,
}: {
  id: number;
  showText?: boolean;
  variant?: "destructive" | "destructive-outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onDeleteSuccess?: () => void;
}) {
  const utils = api.useUtils();
  const { mutate: deleteProduct, isPending } =
    api.admin.products.mutations.delete.useMutation();

  function handleDelete() {
    deleteProduct(
      { id },
      {
        onSuccess: () => {
          onDeleteSuccess?.();
          void utils.admin.products.queries.getPage.invalidate();
        },
      },
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={isPending}>
        <Button variant={variant} size={size} className={className}>
          <TrashIcon />
          {showText && "Delete product"}
        </Button>
      </AlertDialogTrigger>
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
