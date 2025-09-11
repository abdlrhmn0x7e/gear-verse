"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product-form";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useUploadFilesMutation } from "~/hooks/mutations/use-upload-files-mutations";
import { tryCatch } from "~/lib/utils/try-catch";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "~/components/spinner";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { useUploadFileMutation } from "~/hooks/mutations/use-upload-file-mutation";

export function AddProduct() {
  const [submitOutput, setSubmitOutput] = useState<string | null>(null);
  const router = useRouter();
  const { mutateAsync: createProduct, isPending: isCreatingProduct } =
    api.products.create.useMutation();
  const {
    mutateAsync: createProductVariant,
    isPending: isCreatingProductVariant,
  } = api.productVariants.create.useMutation();
  const { mutateAsync: uploadThumbnail, isPending: isUploadingThumbnail } =
    useUploadFileMutation();
  const { mutateAsync: uploadImages, isPending: isUploadingImages } =
    useUploadFilesMutation();

  const isLoading =
    isCreatingProduct ||
    isUploadingImages ||
    isCreatingProductVariant ||
    isUploadingThumbnail;

  async function onSubmit(data: ProductFormValues) {
    const { variants, ...productData } = data;
    setSubmitOutput("Creating product...");
    const { data: product, error: productError } = await tryCatch(
      createProduct({
        ...productData,
        specifications: productData.specifications.reduce(
          (acc, { name, value }) => {
            return {
              ...acc,
              [name]: value,
            };
          },
          {},
        ),
      }),
    );
    if (productError || !product) {
      setSubmitOutput(null);
      toast.error("Failed to create product. Please try again.");
      return;
    }

    // Upload & Create Variants
    setSubmitOutput("Creating product variants...");
    const { error: variantsError } = await tryCatch(
      Promise.all(
        variants.map(async (variant) => {
          const { thumbnail, images, ...variantData } = variant;
          if (
            !thumbnail ||
            !images ||
            thumbnail.length === 0 ||
            images.length === 0
          ) {
            throw new Error("Variant Thumbnail and Images are required");
          }

          const thumbnailMedia = await uploadThumbnail({ file: thumbnail[0]! });

          const createdVariant = await createProductVariant({
            ...variantData,
            thumbnailMediaId: thumbnailMedia.mediaId,
            productId: product.id,
          });

          await uploadImages({
            files: images,
            ownerId: createdVariant.id,
            ownerType: "PRODUCT_VARIANT",
          });

          return createdVariant;
        }),
      ),
    );

    if (variantsError) {
      setSubmitOutput(null);
      toast.error("Failed to create product variants. Please try again.");
      return;
    }

    setSubmitOutput("Product has been created successfully");
    router.push(`/admin/products?productId=${product.id}`);
  }

  return (
    <div>
      <ProductForm onSubmit={onSubmit} />

      <motion.div
        className="fixed right-2 bottom-2 z-50 sm:right-10 sm:bottom-10"
        layoutRoot
      >
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
                className="bg-background/80 z-50 rounded-md border px-4 py-2 backdrop-blur-sm"
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
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <CheckIcon className="size-6 text-green-500" />
                  )}
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
