import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";

import { CategoryForm, type CategoryFormValues } from "../forms/category-form";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "~/components/spinner";

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createCategory, isPending: isCreatingCategory } =
    api.categories.create.useMutation();
  const utils = api.useUtils();

  function handleSubmit(data: CategoryFormValues) {
    console.log(data);
    createCategory(data, {
      onSuccess: () => {
        toast.success("Category created successfully");
        void utils.categories.findAll.invalidate();
        setOpen(false);
      },
    });
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger asChild>
        <Button variant="ghost" className="w-full rounded-t-none">
          <PlusCircleIcon />
          Add Category
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogTitle className="flex items-center gap-2">
          <PlusCircleIcon />
          Add Category
        </DrawerDialogTitle>
        <DrawerDialogDescription>
          Add a new category to the products category tree.
        </DrawerDialogDescription>

        <CategoryForm onSubmit={handleSubmit} />

        <DrawerDialogFooter>
          <Button disabled={isCreatingCategory} form="category-form">
            {isCreatingCategory ? <Spinner /> : <PlusCircleIcon />}
            Add Category
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
