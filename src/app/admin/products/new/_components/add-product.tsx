"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PackageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { DraftSelector } from "~/app/admin/_components/draft-selector";
import { DraftStatus } from "~/app/admin/_components/draft-status";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product";
import { Heading } from "~/components/heading";
import { SaveBar } from "~/app/admin/_components/save-bar";
import { useProductDraft } from "~/hooks/use-product-draft";
import { useTRPC } from "~/trpc/client";

export function AddProduct() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UseFormReturn<ProductFormValues> | null>(
    null,
  );

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

  const { mutate: createProduct, isPending: isCreatingProduct } = useMutation(
    trpc.admin.products.mutations.createDeep.mutationOptions({
      onSuccess: () => {
        toast.success("Product created successfully");
        draft.clearDraftOnSubmit();
        void queryClient.invalidateQueries(
          trpc.admin.products.queries.getPage.pathFilter(),
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="from-card to-accent rounded-lg bg-radial-[at_50%_75%] p-px">
            <div className="to-card from-accent flex size-10 items-center justify-center rounded-md bg-radial-[at_25%_25%]">
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

      {/* a new product always has something to create, a restored draft included */}
      <SaveBar
        form="product-form"
        visible
        saving={isCreatingProduct}
        label="New product"
        saveLabel="Create product"
      />
    </div>
  );
}
