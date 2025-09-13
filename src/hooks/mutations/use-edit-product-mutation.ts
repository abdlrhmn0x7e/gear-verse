import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, type RouterOutputs, type RouterInputs } from "~/trpc/react";
import {
  useUploadFileMutation,
  type UseUploadFileMutationProps,
} from "./use-upload-file-mutation";
import {
  useUploadFilesMutation,
  type UseUploadFilesMutationProps,
} from "./use-upload-files-mutations";
import { useMutation } from "@tanstack/react-query";
import type { ProductFormValues } from "~/app/admin/_components/forms/product-form";
import { tryCatch } from "~/lib/utils/try-catch";
import { toast } from "sonner";

async function editProduct(
  data: ProductFormValues,
  product: RouterOutputs["admin"]["products"]["findById"],

  setSubmitOutput: (output: string | null) => void,

  uploadThumbnail: (
    params: UseUploadFileMutationProps,
  ) => Promise<{ url: string; mediaId: number }>,
  updateProduct: (
    params: RouterInputs["admin"]["products"]["update"],
  ) => Promise<RouterOutputs["admin"]["products"]["update"]>,
  createProductVariant: (
    params: RouterInputs["admin"]["productVariants"]["create"],
  ) => Promise<RouterOutputs["admin"]["productVariants"]["create"]>,
  updateProductVariants: (
    params: RouterInputs["admin"]["productVariants"]["bulkUpdate"],
  ) => Promise<RouterOutputs["admin"]["productVariants"]["bulkUpdate"]>,
  uploadImages: (params: UseUploadFilesMutationProps) => Promise<void>,
) {
  const { variants, thumbnail, ...productData } = data;
  let thumbnailMediaId: number | undefined;
  // this is a client side file that was added by the user
  if (thumbnail?.[0]) {
    const { data: thumbnailMedia, error: thumbnailMediaError } = await tryCatch(
      uploadThumbnail({ file: thumbnail[0] }),
    );
    if (thumbnailMediaError || !thumbnailMedia) {
      setSubmitOutput(null);
      toast.error("Failed to upload thumbnail. Please try again.");
      return;
    }
    thumbnailMediaId = thumbnailMedia.mediaId;
  }

  const newVariants = variants.filter((variant) => !variant.id);
  const updatedVariants = product.variants
    .filter((variant) => variants.some((v) => v.id === variant.id))
    .map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
      options: variant.options,
      productId: product.id,
    }));

  // Create new variants
  if (newVariants.length > 0) {
    setSubmitOutput("Creating the new product variants...");
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
            toast.error("Variant Thumbnail and Images are required");
            return Promise.reject(
              new Error("Variant Thumbnail and Images are required"),
            );
          }

          const thumbnailMedia = await uploadThumbnail({
            file: thumbnail[0]!,
          });

          const createdVariant = await createProductVariant({
            ...variantData,
            thumbnailMediaId: thumbnailMedia.mediaId,
            productId: product.id,
            options: variantData.options.map((option) => option.value),
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
    setSubmitOutput("Updating the existing product variants...");
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
        thumbnailMediaId,
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
}

export function useEditProductMutation(
  product: RouterOutputs["admin"]["products"]["findById"],
) {
  const router = useRouter();
  const utils = api.useUtils();
  const [output, setOutput] = useState<string | null>(null);

  const { mutateAsync: createProductVariant } =
    api.admin.productVariants.create.useMutation();
  const { mutateAsync: uploadThumbnail } = useUploadFileMutation();
  const { mutateAsync: uploadImages } = useUploadFilesMutation();
  const { mutateAsync: updateProductVariants } =
    api.admin.productVariants.bulkUpdate.useMutation();
  const { mutateAsync: updateProduct } =
    api.admin.products.update.useMutation();

  return {
    output,
    ...useMutation({
      mutationFn: (data: ProductFormValues) =>
        editProduct(
          data,
          product,
          setOutput,
          uploadThumbnail,
          updateProduct,
          createProductVariant,
          updateProductVariants,
          uploadImages,
        ),
      onSuccess: () => {
        setOutput("Product has been updated successfully");
        void utils.admin.products.getPage.invalidate();
        void utils.admin.products.findById.invalidate({ id: product.id });
        router.push(`/admin/products?productId=${product.id}`);
      },
      onError: () => {
        setOutput("Failed to update product. Please try again.");
      },
    }),
  };
}
