"use client";

import { PencilIcon, SaveIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogBody,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";
import { ReviewForm, type ReviewFormValues } from "./review-form";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function EditReview({
  review,
  productId,
}: {
  review: RouterOutput["public"]["reviews"]["queries"]["findAll"][number];
  productId: number;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateReview, isPending: updatingReview } = useMutation(
    trpc.public.reviews.mutations.update.mutationOptions(),
  );

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
          void queryClient.invalidateQueries({
            queryKey: trpc.public.reviews.queries.findAll.queryKey({
              productId,
            }),
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

        <DrawerDialogBody>
          <ReviewForm
            onSubmit={onSubmit}
            defaultValues={review}
            id={review.id}
          />
        </DrawerDialogBody>

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
