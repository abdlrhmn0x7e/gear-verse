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
  useCreateProductVariantMutation,
  type UseCreateProductVariantMutationProps,
} from "./use-create-product-variant-mutation";

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
    params: UseCreateProductVariantMutationProps,
  ) => Promise<RouterOutputs["admin"]["productVariants"]["create"]>,
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
      variants.map((variant) => {
        return createProductVariant({
          variant,
          productId: product.id,
        });
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
    useCreateProductVariantMutation();
  const { mutateAsync: uploadThumbnail } = useUploadFileMutation();

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
