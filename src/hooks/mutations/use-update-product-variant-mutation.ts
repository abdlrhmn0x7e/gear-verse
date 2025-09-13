import { useMutation } from "@tanstack/react-query";
import { api, type RouterInputs, type RouterOutputs } from "~/trpc/react";
import {
  useUploadFileMutation,
  type UseUploadFileMutationProps,
} from "./use-upload-file-mutation";
import { tryCatch } from "~/lib/utils/try-catch";
import {
  useUploadFilesMutation,
  type UseUploadFilesMutationProps,
} from "./use-upload-files-mutations";

export type MutationVariant =
  RouterInputs["admin"]["productVariants"]["update"] & {
    thumbnail?: File[] | undefined;
    images?: File[] | undefined;
  };

async function updateFullProductVariant(
  variant: MutationVariant,

  uploadThumbnail: (
    params: UseUploadFileMutationProps,
  ) => Promise<{ url: string; mediaId: number }>,
  uploadImages: (params: UseUploadFilesMutationProps) => Promise<void>,
  updateProductVariant: (
    params: RouterInputs["admin"]["productVariants"]["update"],
  ) => Promise<RouterOutputs["admin"]["productVariants"]["update"]>,
) {
  const thumbnail = variant.thumbnail?.[0];
  let newThumbnailMediaId: number | undefined = undefined;
  if (thumbnail) {
    const { data: uploadThumbnailData, error: uploadThumbnailError } =
      await tryCatch(uploadThumbnail({ file: thumbnail }));

    if (uploadThumbnailError) {
      throw new Error("Failed to upload thumbnail");
    }

    newThumbnailMediaId = uploadThumbnailData?.mediaId;
  }

  if (variant.images) {
    const { error: uploadImagesError } = await tryCatch(
      uploadImages({
        files: variant.images,
        ownerId: variant.id,
        ownerType: "PRODUCT_VARIANT",
      }),
    );

    if (uploadImagesError) {
      throw new Error("Failed to upload images");
    }
  }

  return updateProductVariant({
    id: variant.id,
    name: variant.name,
    options: variant.options,
    price: variant.price,
    stock: variant.stock,
    thumbnailMediaId: newThumbnailMediaId,
    oldThumbnailMediaId: variant.oldThumbnailMediaId ?? null,
  });
}

export function useUpdateProductVariantMutation() {
  const { mutateAsync: uploadThumbnail } = useUploadFileMutation();
  const { mutateAsync: uploadImages } = useUploadFilesMutation();
  const { mutateAsync: updateProductVariant } =
    api.admin.productVariants.update.useMutation();

  return useMutation({
    mutationFn: (productVariant: MutationVariant) => {
      return updateFullProductVariant(
        productVariant,
        uploadThumbnail,
        uploadImages,
        updateProductVariant,
      );
    },
  });
}
