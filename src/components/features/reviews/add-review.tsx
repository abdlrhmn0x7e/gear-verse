"use client";

import { Button } from "~/components/ui/button";
import { ReviewForm, type ReviewFormValues } from "./review-form";
import { SendIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

export function AddReview({
  productId,
  disabled,
  className,
}: {
  productId: number;
  disabled: boolean;
  className?: string;
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate: createReview, isPending: isCreatingReview } =
    api.public.reviews.create.useMutation();

  function onSubmit(data: ReviewFormValues) {
    createReview(
      { productId, ...data },
      {
        onSuccess: () => {
          router.refresh();
          void utils.public.reviews.findAll.invalidate({ productId });
          toast.success("Review created successfully");
        },
      },
    );
  }

  return (
    <div
      className={cn(
        "relative",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <ReviewForm onSubmit={onSubmit} disabled={disabled} />
      <Button
        size="icon"
        className="absolute right-2 bottom-2"
        type="submit"
        form="review-form"
        disabled={isCreatingReview || disabled}
      >
        {isCreatingReview ? <Spinner /> : <SendIcon />}
      </Button>
    </div>
  );
}
