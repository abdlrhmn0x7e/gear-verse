"use client";

import { Button } from "~/components/ui/button";
import {
  CategoryForm,
  type CategoryFormValues,
} from "../../_components/forms/category-form";
import { PlusIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/spinner";

export function AddCategory({
  parentCategoryId,
  onSuccess,
  cancel,
}: {
  parentCategoryId: number;
  onSuccess: () => void;
  cancel: () => void;
}) {
  const utils = api.useUtils();
  const { mutate: createCategory, isPending: isCreatingCategory } =
    api.admin.categories.mutations.create.useMutation({
      onSuccess: () => {
        void utils.admin.categories.queries.findAll.invalidate();
        onSuccess();
      },
    });

  function onSubmit(data: CategoryFormValues) {
    createCategory(data);
  }

  return (
    <div className="flex flex-col gap-2">
      <CategoryForm
        defaultValues={{ parent_id: parentCategoryId }}
        onSubmit={onSubmit}
        showParentCombobox={false}
      />
      <div className="flex items-center justify-between">
        <Button variant="destructive" onClick={cancel}>
          Cancel
        </Button>

        <Button
          type="submit"
          form="category-form"
          disabled={isCreatingCategory}
        >
          {isCreatingCategory ? <Spinner /> : <PlusIcon />}
          Add
        </Button>
      </div>
    </div>
  );
}
