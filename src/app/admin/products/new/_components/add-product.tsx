"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, PackageIcon, SaveIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { RestoreDraftDialog } from "~/app/admin/_components/dialogs/restore-draft";
import { DraftSelector } from "~/app/admin/_components/draft-selector";
import { DraftStatus } from "~/app/admin/_components/draft-status";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product";
import { Heading } from "~/components/heading";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { useProductDraft } from "~/hooks/use-product-draft";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";

export function AddProduct() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UseFormReturn<ProductFormValues> | null>(
    null,
  );
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const hasShownRestoreDialog = useRef(false);

  const draft = useProductDraft({
    form,
    enabled: !!form,
  });

  const handleFormReady = useCallback(
    (formInstance: UseFormReturn<ProductFormValues>) => {
      setForm(formInstance);
    },
    [],
  );

  useEffect(() => {
    if (
      draft.isHydrated &&
      draft.hasDraftsToRestore &&
      !hasShownRestoreDialog.current
    ) {
      hasShownRestoreDialog.current = true;
      setShowRestoreDialog(true);
    }
  }, [draft.isHydrated, draft.hasDraftsToRestore]);

  const { mutate: createProduct, isPending: isCreatingProduct } = useMutation(
    trpc.admin.products.mutations.createDeep.mutationOptions({
      onSuccess: () => {
        toast.success("Product created successfully");
        draft.clearDraftOnSubmit();
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

  function handleRestoreDraft(draftId: string) {
    draft.switchToDraft(draftId);
    setShowRestoreDialog(false);
  }

  function handleStartFresh() {
    draft.discardCurrentDraft();
    setShowRestoreDialog(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="from-card to-accent rounded-lg bg-radial-[at_50%_75%] p-px">
            <div className="to-card from-accent flex size-10 items-center justify-center rounded-[calc(var(--radius)-2px)] bg-radial-[at_25%_25%]">
              <PackageIcon className="text-foreground size-5" />
            </div>
          </div>
          <div>
            <Heading level={5}>Add Product</Heading>
            <p className="text-muted-foreground text-xs">
              Add a new product to your store
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DraftStatus
            lastSaved={draft.lastSaved}
            isSaving={draft.isSaving}
            isHydrated={draft.isHydrated}
          />
          <DraftSelector
            drafts={draft.allDrafts}
            activeDraft={draft.activeDraft}
            isHydrated={draft.isHydrated}
            onSelectDraft={draft.switchToDraft}
            onCreateDraft={draft.createNewDraft}
            onDeleteDraft={draft.deleteDraft}
            onRenameDraft={draft.renameDraft}
          />
        </div>
      </div>

      <ProductForm onSubmit={onSubmit} onFormReady={handleFormReady} />

      <RestoreDraftDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        drafts={draft.allDrafts}
        onSelectDraft={handleRestoreDraft}
        onStartFresh={handleStartFresh}
      />

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
