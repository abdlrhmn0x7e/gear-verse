"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/spinner";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function AddProduct() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: createProduct, isPending: isCreatingProduct } = useMutation(
    trpc.admin.products.mutations.createDeep.mutationOptions({
      onSuccess: () => {
        toast.success("Product created successfully");
        void queryClient.invalidateQueries(
          trpc.admin.products.queries.getPage.queryFilter(),
        );
        router.push("/admin/products");
      },
      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
    }),
  );

  function onSubmit(data: ProductFormValues) {
    createProduct(data);
  }

  return (
    <div>
      <ProductForm onSubmit={onSubmit} />

      <motion.div
        className="fixed right-2 bottom-2 z-50 sm:right-10 sm:bottom-10"
        layoutRoot
      >
        <motion.div className="flex flex-col gap-1" layout>
          <motion.div
            className={cn(
              "bg-background/80 rounded-md border px-4 py-2 backdrop-blur-sm",
              isCreatingProduct && "scale-95 opacity-50",
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
                disabled={isCreatingProduct}
              >
                <SaveIcon size={16} />
                Save Product
              </Button>
            </div>
          </motion.div>

          {isCreatingProduct && (
            <AnimatePresence>
              <motion.div
                className="bg-background/80 z-50 rounded-md border px-4 py-2 backdrop-blur-sm"
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
                  {isCreatingProduct ? (
                    <Spinner />
                  ) : (
                    <CheckIcon className="size-6 text-green-500" />
                  )}
                  <div>
                    <p className="flex-1 font-medium">
                      {isCreatingProduct
                        ? "Creating product..."
                        : "Product created successfully"}
                    </p>
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
