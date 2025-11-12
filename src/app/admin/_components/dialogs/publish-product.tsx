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
  onPublishSuccess,
  ...props
}: {
  id: number;
  published: boolean;
  showText?: boolean;
  onPublishSuccess?: () => void;
} & React.ComponentProps<typeof AlertDialog>) {
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
    <AlertDialog {...props}>
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
