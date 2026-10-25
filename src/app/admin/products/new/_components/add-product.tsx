"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "~/components/ui/toast";
import { DraftSelector } from "~/app/admin/_components/draft-selector";
import { DraftStatus } from "~/app/admin/_components/draft-status";
import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product";
import { PageLayout } from "~/app/admin/_components/page-layout";
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
    <PageLayout
      title="Add Product"
      parent={{ title: "Products", href: "/admin/products" }}
      contentWidth="full"
      contentClassName="max-w-7xl"
      headerContent={
        <>
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
        </>
      }
    >
      <div className="bg-primary/80 fixed inset-x-0 top-0 z-50 border-b px-2 py-2 sm:hidden">
        <div className="flex items-center justify-center gap-2">
          <TriangleAlertIcon className="text-primary-foreground size-4 shrink-0" />
          <p className="text-primary-foreground text-sm">
            This page works best on a larger screen.
          </p>
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
    </PageLayout>
  );
}
