"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
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
  const {
    mutateAsync: updateProductVariants,
    isPending: updatingProductVariants,
  } = api.productVariants.bulkUpdate.useMutation();
  const {
    mutateAsync: createProductVariant,
    isPending: creatingProductVariant,
  } = api.productVariants.create.useMutation();
  const { mutateAsync: uploadThumbnail, isPending: uploadingThumbnail } =
    useUploadFileMutation();
  const { mutateAsync: uploadImages, isPending: uploadingImages } =
    useUploadFilesMutation();

  const isLoading =
    updatingProduct ||
    updatingProductVariants ||
    creatingProductVariant ||
    uploadingImages ||
    uploadingThumbnail;

  const onSubmit = async (data: ProductFormValues) => {
    const { variants, ...productData } = data;
    setSubmitOutput("Updating product variants...");

    const newVariants = variants.filter((variant) => !variant.id);
    const updatedVariants = product.variants
      .filter((variant) => variants.some((v) => v.id === variant.id))
      .map((variant) => ({
        id: variant.id,
        name: variant.name,
        productId: product.id,
      }));

    // Create new variants
    if (newVariants.length > 0) {
      const { error: newVariantsError } = await tryCatch(
        Promise.all(
          newVariants.map(async (variant) => {
            const { thumbnail, images, ...variantData } = variant;
            if (
              !thumbnail ||
              !images ||
              thumbnail.length === 0 ||
              images.length === 0
            ) {
              throw new Error("Variant Thumbnail and Images are required");
            }

            const thumbnailMedia = await uploadThumbnail({
              file: thumbnail[0]!,
            });

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

      if (newVariantsError) {
        setSubmitOutput(null);
        toast.error("Failed to create product variants. Please try again.");
        return;
      }
    }

    // Update existing variants
    if (updatedVariants.length > 0) {
      const { error: updatedVariantsError } = await tryCatch(
        updateProductVariants(updatedVariants),
      );

      if (updatedVariantsError) {
        setSubmitOutput(null);
        toast.error("Failed to update product variants. Please try again.");
        return;
      }
    }

    setSubmitOutput("Updating product...");
    const { error: productError } = await tryCatch(
      updateProduct({
        id: product.id,
        data: {
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
        },
      }),
    );

    if (productError) {
      setSubmitOutput(null);
      toast.error("Failed to update product. Please try again.");
      return;
    }

    setSubmitOutput("Product has been updated successfully");
    router.push(`/admin/products?productId=${product.id}`);
  };

  return (
    <div>
      <ProductForm
        onSubmit={onSubmit}
        defaultValues={{
          title: product.title,
          description: product.description,
          categoryId: product.categoryId,
          brandId: product.brand.id,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
          })),
          specifications: Object.entries(product.specifications).map(
            ([name, value]) => ({
              name,
              value,
            }),
          ),
        }}
        oldVariantsAssets={product.variants.map((variant) => ({
          thumbnail: variant.thumbnail ?? undefined,
          images: variant.images,
        }))}
      />

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
