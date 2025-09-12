"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product-form";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { useEditProductMutation } from "~/hooks/mutations/use-edit-product-mutation";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";

export function EditProduct({
  product,
}: {
  product: RouterOutputs["admin"]["products"]["findById"];
}) {
  const {
    output: submitOutput,
    mutate: editProduct,
    isPending: editingProduct,
  } = useEditProductMutation(product);

  function onSubmit(data: ProductFormValues) {
    editProduct(data);
  }

  return (
    <div>
      <ProductForm
        onSubmit={onSubmit}
        defaultValues={{
          name: product.name,
          summary: product.summary,
          description: product.description,
          categoryId: product.categoryId,
          brandId: product.brand.id,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            stock: variant.stock,
            price: variant.price,
            options: variant.options.map((option) => ({ value: option })),
          })),
          specifications: Object.entries(product.specifications).map(
            ([name, value]) => ({
              name,
              value,
            }),
          ),
        }}
        oldThumbnailAsset={product.thumbnail ?? undefined}
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

              <Button
                type="submit"
                form="product-form"
                disabled={editingProduct}
              >
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
                  {editingProduct ? (
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
