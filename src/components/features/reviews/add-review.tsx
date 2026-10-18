"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLineIcon, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
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
import { useTRPC } from "~/trpc/client";
import { ReviewForm, type ReviewFormValues } from "./review-form";

/** The review form waits behind a button, so it never crowds the reviews themselves. */
export function AddReview({ productId }: { productId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: createReview, isPending: isCreatingReview } = useMutation(
    trpc.public.reviews.mutations.create.mutationOptions(),
  );

  function onSubmit(data: ReviewFormValues) {
    createReview(
      { productId, ...data },
      {
        onSuccess: () => {
          setIsOpen(false);
          router.refresh();
          void queryClient.invalidateQueries({
            queryKey: trpc.public.reviews.queries.findAll.queryKey({
              productId,
            }),
          });
          toast.success("Review created successfully");
        },
      },
    );
  }

  return (
    <DrawerDialog open={isOpen} onOpenChange={setIsOpen}>
      <DrawerDialogTrigger asChild>
        <Button variant="outline" size="lg">
          <PencilLineIcon data-icon="inline-start" />
          Write a review
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Write a review</DrawerDialogTitle>
          <DrawerDialogDescription>
            Tell other customers what you thought of it.
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <DrawerDialogBody>
          <ReviewForm onSubmit={onSubmit} />
        </DrawerDialogBody>

        <DrawerDialogFooter>
          <Button type="submit" form="review-form" disabled={isCreatingReview}>
            {isCreatingReview ? <Spinner /> : <SendIcon />}
            Post review
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
