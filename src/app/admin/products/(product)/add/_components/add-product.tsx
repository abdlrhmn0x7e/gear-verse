"use client";

import { SaveIcon } from "lucide-react";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product-form";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useUploadFilesMutation } from "~/hooks/mutations/use-upload-files-mutations";
import { tryCatch } from "~/lib/utils/try-catch";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "~/components/spinner";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

export function AddProduct() {
  const [submitOutput, setSubmitOutput] = useState<string | null>(null);
  const router = useRouter();
  const { mutateAsync: createProduct, isPending: isCreatingProduct } =
    api.products.create.useMutation();
  const { mutateAsync: uploadImages, isPending: isUploadingImages } =
    useUploadFilesMutation();
  const isLoading = isCreatingProduct || isUploadingImages;

  async function onSubmit(data: ProductFormValues) {
    setSubmitOutput("Creating product...");
    const { data: productData, error: productError } = await tryCatch(
      createProduct({
        ...data,
      }),
    );
    if (productError || !productData) {
      setSubmitOutput(null);
      toast.error("Failed to create product. Please try again.");
      return;
    }

    if (!data.images) {
      setSubmitOutput(null);
      router.push(`/admin/products`); // Todo: redirect to the product page
      toast.success("Product created successfully");
      return;
    }

    setSubmitOutput("Uploading images...");
    const { error: imagesError } = await tryCatch(
      uploadImages({
        files: data.images,
        ownerType: "PRODUCT",
        ownerId: productData.id,
      }),
    );

    if (imagesError) {
      setSubmitOutput(null);
      console.error(imagesError);
      toast.error("Failed to upload images. Please try again.");
      return;
    }

    setSubmitOutput(null);
    router.push(`/admin/products`); // Todo: redirect to the product page
    toast.success("Product created successfully");
  }

  return (
    <div>
      <ProductForm onSubmit={onSubmit} />

      <motion.div className="fixed right-10 bottom-10" layoutRoot>
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

              <Button type="submit" form="product-form" disabled={isLoading}>
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
                  <Spinner />
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
