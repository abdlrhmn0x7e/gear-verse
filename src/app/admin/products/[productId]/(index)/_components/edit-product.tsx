"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFormState, type UseFormReturn } from "react-hook-form";
import { toast } from "~/components/ui/toast";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product";
import { SaveBar } from "~/app/admin/_components/save-bar";
import { type RouterOutput, useTRPC } from "~/trpc/client";

export function EditProduct({
  product,
}: {
  product: RouterOutput["admin"]["products"]["queries"]["findById"];
}) {
  const router = useRouter();
  const trpc = useTRPC();
  const [form, setForm] = useState<UseFormReturn<ProductFormValues> | null>(
    null,
  );
  // Discarding mounts a fresh form: the description editor, media, options
  // and variants keep their own state, which a form reset doesn't reach.
  const [formKey, setFormKey] = useState(0);
  const queryClient = useQueryClient();
  const { mutate: updateProduct, isPending: isUpdatingProduct } = useMutation(
    trpc.admin.products.mutations.editDeep.mutationOptions(),
  );

  function onSubmit(data: Partial<ProductFormValues>) {
    updateProduct(
      {
        id: product.id,
        data: {
          ...data,
          inventory: data.inventory
            ? {
                id: product.inventory?.id, // always send the id even if it's not changed
                quantity: data.inventory?.quantity ?? 0, //  there's always one inventory item for a product
              }
            : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Product updated successfully");
          void queryClient.invalidateQueries(
            trpc.admin.products.queries.getPage.pathFilter(),
          );
          void queryClient.invalidateQueries(
            trpc.admin.products.queries.findById.queryFilter({
              id: product.id,
            }),
          );

          router.push(`/admin/products`);
        },
        onError: () => {
          toast.error("Failed to update product");
        },
      },
    );
  }

  const defaultValues = useMemo(
    (): Partial<ProductFormValues> => ({
      title: product.title,
      summary: product.summary,
      description: product.description,

      published: product.published,
      condition: product.condition,
      allowBackorder: product.allowBackorder,

      price: product.price,
      strikeThroughPrice: product.strikeThroughPrice ?? 0,
      originalCost:
        product.profit && product.price
          ? product.price - product.profit
          : undefined,

      categoryId: product.categoryId,
      brandId: product.brandId,

      seo: {
        pageTitle: product.seo?.pageTitle ?? "",
        urlHandler: product.seo?.urlHandler ?? "",
        metaDescription: product.seo?.metaDescription ?? "",
      },

      inventory: {
        id: product.inventory?.id,
        quantity: product.inventory?.quantity ?? 0,
      },

      media: [product.thumbnail, ...product.media],
      attributeIds: product.attributeIds ?? [],
      options: product.options ?? [],
      variants: product.variants,
    }),
    [product],
  );

  return (
    <>
      <ProductForm
        key={formKey}
        onSubmitPartial={onSubmit}
        defaultValues={defaultValues}
        onFormReady={setForm}
      />

      {form && (
        <ProductSaveBar
          form={form}
          saving={isUpdatingProduct}
          onDiscard={() => {
            setForm(null);
            setFormKey((key) => key + 1);
          }}
        />
      )}
    </>
  );
}

/** Shows while the product has unsaved edits; discarding puts back what was loaded. */
function ProductSaveBar({
  form,
  saving,
  onDiscard,
}: {
  form: UseFormReturn<ProductFormValues>;
  saving: boolean;
  onDiscard: () => void;
}) {
  const { isDirty } = useFormState({ control: form.control });

  return (
    <SaveBar
      form="product-form"
      visible={isDirty || saving}
      saving={saving}
      saveLabel="Save product"
      onDiscard={onDiscard}
    />
  );
}
