"use client";

import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {
  CategoryForm,
  type CategoryFormValues,
} from "~/app/admin/_components/forms/category-form";

export function AddCategory({
  parentCategoryId,
  onSuccess,
  cancel,
}: {
  parentCategoryId: number | null;
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cancel]);

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
