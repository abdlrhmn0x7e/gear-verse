import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, type RouterOutputs, type RouterInputs } from "~/trpc/react";
import {
  useUploadFileMutation,
  type UseUploadFileMutationProps,
} from "./use-upload-file-mutation";
import { useMutation } from "@tanstack/react-query";
import type { ProductFormValues } from "~/app/admin/_components/forms/product-form";
import { tryCatch } from "~/lib/utils/try-catch";
import { toast } from "sonner";
import {
  useCreateProductVariantMutation,
  type UseCreateProductVariantMutationProps,
} from "./use-create-product-variant-mutation";

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
    params: UseCreateProductVariantMutationProps,
  ) => Promise<RouterOutputs["admin"]["productVariants"]["create"]>,
  updateProductVariants: (
    params: RouterInputs["admin"]["productVariants"]["bulkUpdate"],
  ) => Promise<RouterOutputs["admin"]["productVariants"]["bulkUpdate"]>,
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
      ...variant,
      productId: product.id,

      // we don't want the images and thumbnail
      images: undefined,
      thumbnail: undefined,
    }));

  // Create new variants
  if (newVariants.length > 0) {
    setSubmitOutput("Creating the new product variants...");
    const { error: newVariantsError } = await tryCatch(
      Promise.all(
        newVariants.map((variant) => {
          return createProductVariant({
            variant,
            productId: product.id,
          });
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
    useCreateProductVariantMutation();
  const { mutateAsync: uploadThumbnail } = useUploadFileMutation();
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
