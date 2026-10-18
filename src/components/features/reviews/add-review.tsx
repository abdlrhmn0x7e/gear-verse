"use client";

import { Button } from "~/components/ui/button";
import { ReviewForm, type ReviewFormValues } from "./review-form";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { useRouter } from "next/navigation";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function AddReview({ productId }: { productId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate: createReview, isPending: isCreatingReview } = useMutation(
    trpc.public.reviews.mutations.create.mutationOptions(),
  );

  function onSubmit(data: ReviewFormValues) {
    createReview(
      { productId, ...data },
      {
        onSuccess: () => {
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
    <div className="relative">
      <ReviewForm onSubmit={onSubmit} />
      <Button
        size="icon"
        aria-label="Post review"
        className="absolute right-3 bottom-3"
        type="submit"
        form="review-form"
        disabled={isCreatingReview}
      >
        {isCreatingReview ? <Spinner /> : <SendIcon />}
      </Button>
    </div>
  );
}
