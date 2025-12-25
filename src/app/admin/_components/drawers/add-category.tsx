"use client";

import { PlusCircleIcon, TagIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CategoryForm, type CategoryFormValues } from "../forms/category-form";
import { toast } from "sonner";
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

export function AddCategoryDrawer() {
  const isMobile = useIsMobile();
  const drawer = useDialog();
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
        drawer.dismiss();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create category");
      },
    });
  }

  return (
    <Drawer {...drawer.props} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="w-full rounded-t-none">
          <PlusCircleIcon />
          Add Category
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <TagIcon />
            <DrawerTitle>Add Category</DrawerTitle>
          </div>
          <DrawerDescription>
            Add a new category to your store.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <CategoryForm
            defaultValues={{ parent_id: null }}
            onSubmit={handleSubmit}
            showParentCombobox={true}
          />
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            form="category-form"
            disabled={isCreatingCategory}
          >
            {isCreatingCategory ? <Spinner /> : <TagIcon />}
            Create Category
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
