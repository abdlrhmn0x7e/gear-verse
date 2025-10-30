"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
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

export function PublishProductDialog({
  id,
  showText = true,
  published,
  variant = "ghost",
  size = "default",
  className,
  onPublishSuccess,
}: {
  id: number;
  published: boolean;
  showText?: boolean;
  variant?:
    | "destructive"
    | "destructive-outline"
    | "ghost"
    | "destructive-ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onPublishSuccess?: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: updateProduct, isPending } = useMutation(
    trpc.admin.products.mutations.editDeep.mutationOptions(),
  );

  function handlePublish() {
    updateProduct(
      { id, data: { published: !published } },
      {
        onSuccess: () => {
          onPublishSuccess?.();
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
        <Button
          variant={published ? "destructive-ghost" : "ghost"}
          size={size}
          className={className}
        >
          {!published ? <CheckCircleIcon /> : <XCircleIcon />}
          {showText && (published ? "Unpublish product" : "Publish product")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {published
              ? "Are you sure you want to unpublish this product? (It will be removed from the website)"
              : "Are you sure you want to publish this product? (It will be added to the website)"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handlePublish}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
