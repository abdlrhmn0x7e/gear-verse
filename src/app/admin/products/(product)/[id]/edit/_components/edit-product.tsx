"use client";

import type { JSONContent } from "@tiptap/react";
import { SaveIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product-form";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { useUploadFileMutation } from "~/hooks/mutations/use-upload-file-mutation";
import { useUploadFilesMutation } from "~/hooks/mutations/use-upload-files-mutations";
import { cn } from "~/lib/utils";
import { tryCatch } from "~/lib/utils/try-catch";
import { api, type RouterOutputs } from "~/trpc/react";

export function EditProduct({
  product,
}: {
  product: Exclude<RouterOutputs["products"]["findById"], undefined>;
}) {
  const router = useRouter();
  const [submitOutput, setSubmitOutput] = useState<string | null>(null);

  const { mutateAsync: updateProduct, isPending: updatingProduct } =
    api.products.update.useMutation();
  const { mutateAsync: uploadFiles, isPending: uploadingFiles } =
    useUploadFilesMutation();
  const { mutateAsync: uploadFile, isPending: uploadingFile } =
    useUploadFileMutation();

  const isLoading = updatingProduct || uploadingFiles || uploadingFile;

  const onSubmit = async (data: ProductFormValues) => {
    const thumbnail = data.thumbnail?.[0];
    let thumbnailMediaId = product.thumbnail!.id;
    if (thumbnail) {
      const { data: thumbnailData, error: thumbnailError } = await tryCatch(
        uploadFile({
          file: thumbnail,
          ownerType: "PRODUCT",
          ownerId: product.id,
        }),
      );

      if (thumbnailError) {
        setSubmitOutput(null);
        toast.error("Failed to upload thumbnail. Please try again.");
        return;
      }

      thumbnailMediaId = thumbnailData.mediaId;
    }

    setSubmitOutput("Updating product...");
    const { error: productError } = await tryCatch(
      updateProduct({
        id: product.id,
        data: {
          ...data,
          thumbnailMediaId,
        },
      }),
    );

    if (productError) {
      setSubmitOutput(null);
      toast.error("Failed to update product. Please try again.");
      return;
    }

    if (data.images) {
      const { error: imagesError } = await tryCatch(
        uploadFiles({
          files: data.images,
          ownerType: "PRODUCT",
          ownerId: product.id,
        }),
      );

      if (imagesError) {
        setSubmitOutput(null);
        toast.error("Failed to upload images. Please try again.");
        return;
      }
    }

    router.push(`/admin/products/${product.id}`);
    setSubmitOutput(null);
    toast.success("Product updated successfully");
  };

  return (
    <div>
      <ProductForm
        onSubmit={onSubmit}
        defaultValues={{
          title: product.title,
          description: product.description as JSONContent,
          categoryId: product.categoryId,
          brandId: product.brand.id!,
        }}
        oldThumbnail={product.thumbnail!}
        oldImages={product.media}
      />

      <motion.div className="fixed right-10 bottom-10" layoutRoot>
        <motion.div className="flex flex-col gap-1" layout>
          <motion.div
            className={cn(
              "bg-background/80 rounded-md border px-4 py-2 backdrop-blur-sm",
              submitOutput && "scale-95 opacity-50",
            )}
            layout
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium">Have you finished?</p>
                <p className="text-muted-foreground text-sm">
                  Click the save button to save your product.
                </p>
              </div>

              <Button type="submit" form="product-form" disabled={isLoading}>
                <SaveIcon size={16} />
                Save Product
              </Button>
            </div>
          </motion.div>

          {submitOutput && (
            <AnimatePresence>
              <motion.div
                className="bg-background/80 rounded-md border px-4 py-2 backdrop-blur-sm"
                initial={{ opacity: 0, y: -40, scale: 0.95 }}
                animate={{ opacity: 1, y: -30, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                layout
              >
                <div className="flex items-center gap-3">
                  <Spinner />
                  <div>
                    <p className="flex-1 font-medium">{submitOutput}</p>
                    <p className="text-muted-foreground text-sm">
                      Please be patient untill the process is complete.
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
