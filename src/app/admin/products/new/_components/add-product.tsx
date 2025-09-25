"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product-form";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/spinner";
import { cn } from "~/lib/utils";

export function AddProduct() {
  function onSubmit(data: ProductFormValues) {
    console.log(data);
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
              false && "scale-95 opacity-50",
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

              <Button type="submit" form="product-form" disabled={false}>
                <SaveIcon size={16} />
                Save Product
              </Button>
            </div>
          </motion.div>

          {false && (
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
                  {false ? (
                    <Spinner />
                  ) : (
                    <CheckIcon className="size-6 text-green-500" />
                  )}
                  <div>
                    <p className="flex-1 font-medium">{false}</p>
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
