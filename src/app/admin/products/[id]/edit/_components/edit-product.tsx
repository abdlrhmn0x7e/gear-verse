"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

export function EditProduct({
  product,
}: {
  product: RouterOutputs["admin"]["products"]["queries"]["findById"];
}) {
  const { mutate: updateProduct, isPending: isUpdatingProduct } =
    api.admin.products.mutations.editDeep.useMutation();
  function onSubmit(data: Partial<ProductFormValues>) {
    console.log("data", data);
    updateProduct({ id: product.id, data });
  }

  return (
    <div>
      <ProductForm
        onSubmitPartial={onSubmit}
        defaultValues={{
          title: product.title,
          summary: product.summary,
          description: product.description,

          published: product.published,
          price: product.price,
          profit: product.profit,
          margin: product.margin,

          categoryId: product.categoryId,
          brandId: product.brandId,

          seo: {
            pageTitle: product.seo?.pageTitle ?? "",
            urlHandler: product.seo?.urlHandler ?? "",
            metaDescription: product.seo?.metaDescription ?? "",
          },

          media: product.media,
          options: product.options,
          variants: product.variants,
        }}
      />

      <motion.div
        className="fixed right-2 bottom-2 z-50 sm:right-10 sm:bottom-10"
        layoutRoot
      >
        <motion.div className="flex flex-col gap-1" layout>
          <motion.div
            className={cn(
              "bg-background/80 rounded-md border px-4 py-2 backdrop-blur-sm",
              isUpdatingProduct && "scale-95 opacity-50",
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
                disabled={isUpdatingProduct}
              >
                <SaveIcon size={16} />
                Save Product
              </Button>
            </div>
          </motion.div>

          {isUpdatingProduct && (
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
                  {isUpdatingProduct ? (
                    <Spinner />
                  ) : (
                    <CheckIcon className="size-6 text-green-500" />
                  )}
                  <div>
                    <p className="flex-1 font-medium">Updating product...</p>
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
