"use client";

import { IconTrash } from "@tabler/icons-react";
import { DeleteDialog } from "~/components/delete-dialog";
import { useTRPC } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "~/i18n/navigation";

export function DeleteReviewDialog({ id }: { id: number }) {
  const t = useTranslations("products.reviews");
  const trpc = useTRPC();
  const router = useRouter();
  const { mutate: deleteReview } = useMutation(
    trpc.public.reviews.mutations.delete.mutationOptions({
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
      title={t("deleteDialog.title")}
      description={t("deleteDialog.description")}
      cancelLabel={t("deleteDialog.cancel")}
      confirmLabel={t("deleteDialog.confirm")}
      handleDelete={handleDelete}
      Trigger={
        <Button
          size="icon"
          variant="destructive-ghost"
          aria-label={t("delete")}
        >
          <IconTrash />
        </Button>
      }
    />
  );
}
