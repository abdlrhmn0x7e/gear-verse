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
}: {
  id: number;
  showText?: boolean;
  variant?: "destructive" | "destructiveGhost";
}) {
  const { mutate: deleteProduct, isPending } =
    api.products.delete.useMutation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={isPending}>
        <Button variant={variant} size={showText ? "default" : "icon"}>
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
          <AlertDialogAction
            disabled={isPending}
            onClick={() => deleteProduct({ id })}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
