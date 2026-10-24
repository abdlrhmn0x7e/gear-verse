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
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "~/components/ui/toast";
import { Spinner } from "~/components/spinner";
import { useRouter } from "~/i18n/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function EditReview({
  review,
  productId,
}: {
  review: RouterOutput["public"]["reviews"]["queries"]["findAll"][number];
  productId: number;
}) {
  const t = useTranslations("products.reviews");
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
          toast.success(t("updated"));
        },
      },
    );
  }

  return (
    <DrawerDialog open={isOpen} onOpenChange={setIsOpen}>
      <DrawerDialogTrigger
        render={<Button variant="ghost" size="icon" aria-label={t("edit")} />}
      >
        <PencilIcon />
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>{t("editTitle")}</DrawerDialogTitle>
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
            {updatingReview ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon data-icon="inline-start" />
            )}
            {t("save")}
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
