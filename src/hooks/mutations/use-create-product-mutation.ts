import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { ProductFormValues } from "~/app/admin/_components/forms/product-form";
import { tryCatch } from "~/lib/utils/try-catch";
import { api, type RouterInputs, type RouterOutputs } from "~/trpc/react";
import {
  useUploadFileMutation,
  type UseUploadFileMutationProps,
} from "./use-upload-file-mutation";
import {
  useUploadFilesMutation,
  type UseUploadFilesMutationProps,
} from "./use-upload-files-mutations";

async function createFullProduct(
  data: ProductFormValues,

  setSubmitOutput: (output: string | null) => void,

  uploadThumbnail: (
    params: UseUploadFileMutationProps,
  ) => Promise<{ url: string; mediaId: number }>,
  createProduct: (
    params: RouterInputs["admin"]["products"]["create"],
  ) => Promise<RouterOutputs["admin"]["products"]["create"]>,
  createProductVariant: (
    params: RouterInputs["admin"]["productVariants"]["create"],
  ) => Promise<RouterOutputs["admin"]["productVariants"]["create"]>,
  uploadImages: (params: UseUploadFilesMutationProps) => Promise<void>,
) {
  const { variants, thumbnail, ...productData } = data;
  if (!thumbnail?.[0]) {
    setSubmitOutput(null);
    toast.error("Thumbnail is required. Please try again.");
    return;
  }

  setSubmitOutput("Uploading thumbnail...");
  const { data: thumbnailMedia, error: thumbnailMediaError } = await tryCatch(
    uploadThumbnail({ file: thumbnail[0] }),
  );
  if (thumbnailMediaError || !thumbnailMedia) {
    setSubmitOutput(null);
    toast.error("Failed to upload thumbnail. Please try again.");
    return;
  }

  setSubmitOutput("Creating product...");
  const { data: product, error: productError } = await tryCatch(
    createProduct({
      ...productData,
      thumbnailMediaId: thumbnailMedia.mediaId,
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

  if (variantsError) {
    setSubmitOutput(null);
    toast.error("Failed to create product variants. Please try again.");
    return;
  }

  return product;
}

export function useCreateProductMutation() {
  const router = useRouter();
  const utils = api.useUtils();
  const [output, setOutput] = useState<string | null>(null);
  const { mutateAsync: createProduct } =
    api.admin.products.create.useMutation();
  const { mutateAsync: createProductVariant } =
    api.admin.productVariants.create.useMutation();
  const { mutateAsync: uploadThumbnail } = useUploadFileMutation();
  const { mutateAsync: uploadImages } = useUploadFilesMutation();

  return {
    output,
    ...useMutation({
      mutationFn: (data: ProductFormValues) =>
        createFullProduct(
          data,
          setOutput,
          uploadThumbnail,
          createProduct,
          createProductVariant,
          uploadImages,
        ),
      onSuccess: (product) => {
        if (!product) {
          return;
        }

        router.push(`/admin/products?productId=${product.id}`);
        void utils.admin.products.getPage.invalidate();
      },
    }),
  };
}
