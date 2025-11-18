"use client";

import { IconTrash } from "@tabler/icons-react";
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
        <Button size="icon" variant="destructive-ghost">
          <IconTrash />
        </Button>
      }
    />
  );
}
