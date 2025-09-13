import { useMutation } from "@tanstack/react-query";
import type { ProductFormValues } from "~/app/admin/_components/forms/product-form";
import type { UseUploadFileMutationProps } from "./use-upload-file-mutation";
import { api, type RouterInputs, type RouterOutputs } from "~/trpc/react";
import type { UseUploadFilesMutationProps } from "./use-upload-files-mutations";
import { useUploadFileMutation } from "./use-upload-file-mutation";
import { useUploadFilesMutation } from "./use-upload-files-mutations";

async function createFullProductVariant(
  productId: number,
  variant: ProductFormValues["variants"][number],

  uploadThumbnail: (
    params: UseUploadFileMutationProps,
  ) => Promise<{ url: string; mediaId: number }>,
  createProductVariant: (
    params: RouterInputs["admin"]["productVariants"]["create"],
  ) => Promise<RouterOutputs["admin"]["productVariants"]["create"]>,
  uploadImages: (params: UseUploadFilesMutationProps) => Promise<void>,
) {
  const { thumbnail, images, ...variantData } = variant;
  if (!thumbnail || !images || thumbnail.length === 0 || images.length === 0) {
    throw new Error("Variant Thumbnail and Images are required");
  }

  const thumbnailMedia = await uploadThumbnail({ file: thumbnail[0]! });

  const createdVariant = await createProductVariant({
    ...variantData,
    thumbnailMediaId: thumbnailMedia.mediaId,
    productId,
    options: variantData.options.map((option) => option.value),
  });

  await uploadImages({
    files: images,
    ownerId: createdVariant.id,
    ownerType: "PRODUCT_VARIANT",
  });

  return createdVariant;
}

export interface UseCreateProductVariantMutationProps {
  variant: ProductFormValues["variants"][number];
  productId: number;
}

export function useCreateProductVariantMutation() {
  const { mutateAsync: createProductVariant } =
    api.admin.productVariants.create.useMutation();
  const { mutateAsync: uploadThumbnail } = useUploadFileMutation();
  const { mutateAsync: uploadImages } = useUploadFilesMutation();

  return useMutation({
    mutationFn: ({
      variant,
      productId,
    }: UseCreateProductVariantMutationProps) =>
      createFullProductVariant(
        productId,
        variant,
        uploadThumbnail,
        createProductVariant,
        uploadImages,
      ),
  });
}
