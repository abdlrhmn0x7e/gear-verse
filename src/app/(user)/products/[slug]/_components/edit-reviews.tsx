"use client";

import { PencilIcon, SaveIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";
import { ReviewForm, type ReviewFormValues } from "./review-form";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { useRouter } from "next/navigation";

export function EditReview({
  review,
  productId,
}: {
  review: RouterOutputs["user"]["reviews"]["findAll"][number];
  productId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateReview, isPending: updatingReview } =
    api.user.reviews.update.useMutation();
  const utils = api.useUtils();
  const router = useRouter();
  function onSubmit(data: ReviewFormValues) {
    updateReview(
      {
        id: review.id,
        rating: data.rating,
        comment: data.comment,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          router.refresh();
          void utils.user.reviews.findAll.invalidate({
            productId,
          });
          toast.success("Review updated successfully");
        },
      },
    );
  }

  return (
    <DrawerDialog open={isOpen} onOpenChange={setIsOpen}>
      <DrawerDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilIcon />
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Edit Review</DrawerDialogTitle>
          <DrawerDialogDescription></DrawerDialogDescription>
        </DrawerDialogHeader>

        <ReviewForm onSubmit={onSubmit} defaultValues={review} id={review.id} />

        <DrawerDialogFooter>
          <Button
            type="submit"
            form={`review-form-${review.id}`}
            disabled={updatingReview}
          >
            {updatingReview ? <Spinner /> : <SaveIcon />}
            Save
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
