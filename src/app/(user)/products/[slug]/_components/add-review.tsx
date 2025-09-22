"use client";

import { Button } from "~/components/ui/button";
import { ReviewForm, type ReviewFormValues } from "./review-form";
import { SendIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { useRouter } from "next/navigation";

export function AddReview({ productId }: { productId: number }) {
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate: createReview, isPending: isCreatingReview } =
    api.user.reviews.create.useMutation();

  function onSubmit(data: ReviewFormValues) {
    createReview(
      { productId, ...data },
      {
        onSuccess: () => {
          router.refresh();
          void utils.user.reviews.findAll.invalidate({ productId });
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
        className="absolute right-2 bottom-2"
        type="submit"
        form="review-form"
        disabled={isCreatingReview}
      >
        {isCreatingReview ? <Spinner /> : <SendIcon />}
      </Button>
    </div>
  );
}
