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
} from "~/components/ui/alert-dialog";
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

  function handlePublish(e: React.MouseEvent) {
    e.stopPropagation();
    updateProduct(
      { id, data: { published: !published } },
      {
        onSuccess: () => {
          onPublishSuccess?.();
          void queryClient.invalidateQueries(
            trpc.admin.products.queries.getPage.infiniteQueryFilter(),
          );
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
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handlePublish}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
