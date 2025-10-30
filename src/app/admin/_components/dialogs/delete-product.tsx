"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useTRPC } from "~/trpc/client";

export function DeleteProductDialog({
  id,
  showText = true,
  variant = "destructive-ghost",
  size = "default",
  className,
  onDeleteSuccess,
}: {
  id: number;
  showText?: boolean;
  variant?: "destructive-ghost" | "destructive-outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onDeleteSuccess?: () => void;
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
