"use client";

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
import { api } from "~/trpc/react";

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
  variant?: "destructive" | "destructiveGhost" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onPublishSuccess?: () => void;
}) {
  const utils = api.useUtils();
  const { mutate: updateProduct, isPending } =
    api.admin.products.mutations.editDeep.useMutation();

  function handlePublish() {
    updateProduct(
      { id, data: { published: !published } },
      {
        onSuccess: () => {
          onPublishSuccess?.();
          void utils.admin.products.queries.getPage.invalidate();
        },
      },
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={isPending}>
        <Button variant={variant} size={size} className={className}>
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
