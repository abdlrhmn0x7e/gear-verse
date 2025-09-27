import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, type RouterOutputs, type RouterInputs } from "~/trpc/react";
import {
  useUploadFileMutation,
  type UseUploadFileMutationProps,
} from "./use-upload-file-mutation";
import { useMutation } from "@tanstack/react-query";
import type { ProductFormValues } from "~/app/admin/_components/forms/product";
import { tryCatch } from "~/lib/utils/try-catch";
import { toast } from "sonner";
import {
  useCreateProductVariantMutation,
  type UseCreateProductVariantMutationProps,
} from "./use-create-product-variant-mutation";
import {
  type MutationVariant,
  useUpdateProductVariantMutation,
} from "./use-update-product-variant-mutation";

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
    params: MutationVariant,
  ) => Promise<RouterOutputs["admin"]["productVariants"]["update"]>,
  bulkDeleteProductVariants: (
    params: RouterInputs["admin"]["productVariants"]["bulkDelete"],
  ) => Promise<RouterOutputs["admin"]["productVariants"]["bulkDelete"]>,
) {
  const { variants, thumbnail, ...productData } = data;
  let thumbnailMediaId: number | undefined;
  // this is a client side file that was added by the user
  if (thumbnail?.[0]) {
    const { data: thumbnailMedia, error: thumbnailMediaError } = await tryCatch(
      uploadThumbnail({
        file: thumbnail[0],
        ownerId: product.id,
        ownerType: "PRODUCT",
      }),
    );
    if (thumbnailMediaError || !thumbnailMedia) {
      setSubmitOutput(null);
      toast.error("Failed to upload thumbnail. Please try again.");
      return;
    }
    thumbnailMediaId = thumbnailMedia.mediaId;
  }

  const newVariants = variants.filter((variant) => !variant.id);

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

  const oldRemainingVariants = variants.filter((variant) => variant.id);
  const deletedVariants = product.variants.filter(
    (variant) => !oldRemainingVariants.some((v) => v.id === variant.id),
  );
  if (deletedVariants.length > 0) {
    setSubmitOutput("Deleting the deleted product variants...");
    const { error: deletedVariantsError } = await tryCatch(
      bulkDeleteProductVariants(deletedVariants.map((variant) => variant.id)),
    );

    if (deletedVariantsError) {
      setSubmitOutput(null);
      toast.error("Failed to delete product variants. Please try again.");
      return;
    }
  }

  const updatedVariants = variants
    .filter((variant) => variant.id)
    .map((variant) => ({
      ...variant,
      options: variant.options.map((option) => option.value),
      oldThumbnailMediaId: product.variants.find((v) => v.id === variant.id)
        ?.thumbnail?.id,
    }));
  // Update existing variants
  if (updatedVariants.length > 0) {
    setSubmitOutput("Updating the existing product variants...");

    const { error: updatedVariantsError } = await tryCatch(
      Promise.all(
        updatedVariants.map((variant) => {
          return updateProductVariants({
            ...variant,
            id: variant.id!,
            oldThumbnailMediaId: variant.oldThumbnailMediaId ?? null,
          });
        }),
      ),
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
    useUpdateProductVariantMutation();
  const { mutateAsync: updateProduct } =
    api.admin.products.update.useMutation();
  const { mutateAsync: bulkDeleteProductVariants } =
    api.admin.productVariants.bulkDelete.useMutation();

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
          bulkDeleteProductVariants,
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
