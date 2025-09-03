"use client";

import { SaveIcon } from "lucide-react";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product-form";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "~/components/ui/button";

export function AddProduct() {
  function onSubmit(data: ProductFormValues) {
    console.log(data);
  }

  return (
    <div>
      <ProductForm onSubmit={onSubmit} />

      <motion.div className="fixed right-10 bottom-10" layoutRoot>
        <motion.div className="flex flex-col gap-1" layout>
          <motion.div
            className="bg-background/80 rounded-md border px-4 py-2 backdrop-blur-sm"
            layout
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium">Have you finished?</p>
                <p className="text-muted-foreground text-sm">
                  Click the save button to save your product.
                </p>
              </div>

              <Button type="submit" form="product-form">
                <SaveIcon size={16} />
                Save Product
              </Button>
            </div>
          </motion.div>

          <AnimatePresence>
            <motion.div
              className="bg-background/80 rounded-md border px-4 py-2 backdrop-blur-sm"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              layout
            >
              <p>Dummy Content</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
