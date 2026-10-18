"use client";

import { Trash2Icon } from "lucide-react";
import { DeleteDialog } from "~/components/delete-dialog";
import { useTRPC } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function DeleteReviewDialog({ id }: { id: number }) {
  const trpc = useTRPC();
  const router = useRouter();
  const { mutate: deleteReview } = useMutation(
    trpc.admin.reviews.mutations.delete.mutationOptions({
      onSuccess: () => {
        router.refresh();
      },
    }),
  );

  function handleDelete() {
    deleteReview({
      id,
    });
  }

  return (
    <DeleteDialog
      entity="Review"
      handleDelete={handleDelete}
      Trigger={
        <Button
          size="icon"
          variant="destructive-ghost"
          aria-label="Delete review"
        >
          <Trash2Icon />
        </Button>
      }
    />
  );
}
