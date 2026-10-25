"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SaveIcon, TagIcon } from "lucide-react";
import { useId } from "react";

import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { toast } from "~/components/ui/toast";
import { useIsMobile } from "~/hooks/use-mobile";
import type { ArabicStatus } from "~/lib/arabic";
import type { CategoryTree } from "~/lib/schemas/entities/category";
import { useTRPC } from "~/trpc/client";
import { CategoryForm, type CategoryFormValues } from "../forms/category-form";

export function EditCategoryDrawer({
  category,
  parentId,
  arabicStatus,
  open,
  onOpenChange,
}: {
  category: Omit<CategoryTree, "children">;
  parentId: number | undefined;
  arabicStatus: ArabicStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formId = useId();
  const isMobile = useIsMobile();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: updateCategory, isPending } = useMutation(
    trpc.admin.categories.mutations.update.mutationOptions({
      onSuccess: () => {
        toast.success("Category updated successfully");
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findAll.queryFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findRoots.queryFilter(),
        );
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't save the category");
      },
    }),
  );

  function handleSubmit(values: CategoryFormValues) {
    updateCategory({ id: category.id, ...values });
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <TagIcon />
            <DrawerTitle>Edit category</DrawerTitle>
          </div>
          <DrawerDescription>
            Update the name, icon, description or Arabic copy.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <CategoryForm
            formId={formId}
            defaultValues={{
              icon: category.icon,
              name: category.name,
              parent_id: parentId,
              description: category.description,
              name_ar: category.name_ar,
              description_ar: category.description_ar,
            }}
            onSubmit={handleSubmit}
            showParentCombobox={false}
            saved={{
              id: category.id,
              arabicStatus,
              onArabicReviewed: () =>
                void queryClient.invalidateQueries(
                  trpc.admin.categories.queries.findAll.queryFilter(),
                ),
            }}
          />
        </div>
        <DrawerFooter>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <SaveIcon data-icon="inline-start" />
            )}
            Save changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
