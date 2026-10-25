"use client";

import { PlusIcon, TagIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "~/components/ui/button";
import { CategoryForm, type CategoryFormValues } from "../forms/category-form";
import { toast } from "~/components/ui/toast";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "~/components/spinner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { useDialog } from "~/hooks/use-dialog";

export function AddCategoryDrawer({
  variant = "ghost",
  parent,
  open,
  onOpenChange,
}: {
  variant?: "default" | "ghost";
  /** Adds a sub-category under it; the parent is fixed, so the form leaves its picker out. */
  parent?: { id: number; name: string };
  /** Opened from elsewhere (a menu item, a button), so the drawer renders no trigger of its own. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const formId = useId();
  const isMobile = useIsMobile();
  const drawer = useDialog();
  const setOpen = onOpenChange ?? drawer.props.onOpenChange;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: createCategory, isPending: isCreatingCategory } = useMutation(
    trpc.admin.categories.mutations.create.mutationOptions(),
  );

  function handleSubmit(data: CategoryFormValues) {
    createCategory(data, {
      onSuccess: () => {
        toast.success("Category created successfully");
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findAll.queryFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findRoots.queryFilter(),
        );
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create category");
      },
    });
  }

  return (
    <Drawer
      open={open ?? drawer.props.open}
      onOpenChange={setOpen}
      swipeDirection={isMobile ? "down" : "right"}
    >
      {open === undefined && (
        <DrawerTrigger render={<Button variant={variant} />}>
          <PlusIcon data-icon="inline-start" />
          Add Category
        </DrawerTrigger>
      )}
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <TagIcon />
            <DrawerTitle>
              {parent ? "Add Sub-Category" : "Add Category"}
            </DrawerTitle>
          </div>
          <DrawerDescription>
            {parent
              ? `Add a new sub-category under ${parent.name}.`
              : "Add a new category to your store."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <CategoryForm
            defaultValues={{ parent_id: parent?.id ?? null }}
            onSubmit={handleSubmit}
            showParentCombobox={!parent}
            formId={formId}
          />
        </div>
        <DrawerFooter>
          <Button type="submit" form={formId} disabled={isCreatingCategory}>
            {isCreatingCategory ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            Create Category
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
