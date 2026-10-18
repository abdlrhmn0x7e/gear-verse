"use client";

import { useMutation } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { useTRPC } from "~/trpc/client";
import { useRefreshOrderViews } from "../../_hooks/use-refresh-order-views";

export function DeleteOrderDialog({
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
  const refreshOrderViews = useRefreshOrderViews();
  const { mutate: deleteOrder, isPending } = useMutation(
    trpc.admin.orders.mutations.delete.mutationOptions(),
  );

  function handleDelete() {
    deleteOrder(
      { id },
      {
        onSuccess: () => {
          onDeleteSuccess?.();
          void refreshOrderViews();
        },
        onError: (error) => {
          toast.error(
            error.message || `Couldn't delete order #${id}. Try again.`,
          );
        },
      },
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={isPending}>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={showText ? undefined : "Delete order"}
        >
          <Trash2Icon data-icon={showText ? "inline-start" : undefined} />
          {showText && "Delete order"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the order
            and remove its data from our servers.
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
            Delete order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
