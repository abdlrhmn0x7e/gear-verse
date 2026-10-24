"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLineIcon, SendIcon } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "~/components/ui/toast";
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
  const t = useTranslations("products.reviews");
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
          toast.success(t("created"));
        },
      },
    );
  }

  return (
    <DrawerDialog open={isOpen} onOpenChange={setIsOpen}>
      <DrawerDialogTrigger render={<Button variant="outline" size="lg" />}>
        <PencilLineIcon data-icon="inline-start" />
        {t("write")}
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>{t("write")}</DrawerDialogTitle>
          <DrawerDialogDescription>
            {t("writeDescription")}
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <DrawerDialogBody>
          <ReviewForm onSubmit={onSubmit} />
        </DrawerDialogBody>

        <DrawerDialogFooter>
          <Button type="submit" form="review-form" disabled={isCreatingReview}>
            {isCreatingReview ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SendIcon data-icon="inline-start" />
            )}
            {t("post")}
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
