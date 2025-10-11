"use client";

import { Button } from "~/components/ui/button";
import {
  CategoryForm,
  type CategoryFormValues,
} from "../../_components/forms/category-form";
import { SaveIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/spinner";
import { useEffect } from "react";

export function EditCategory({
  id,
  defaultValues,
  onSuccess,
  cancel,
}: {
  id: number;
  defaultValues: CategoryFormValues;
  onSuccess: () => void;
  cancel: () => void;
}) {
  const utils = api.useUtils();
  const { mutate: updateCategory, isPending: isUpdatingCategory } =
    api.admin.categories.mutations.update.useMutation({
      onSuccess: () => {
        void utils.admin.categories.queries.findAll.invalidate();
        onSuccess();
      },
    });

  function onSubmit(data: CategoryFormValues) {
    updateCategory({ id, ...data });
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
    <div className="flex h-full w-full flex-col gap-2">
      <CategoryForm
        defaultValues={defaultValues}
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
          disabled={isUpdatingCategory}
        >
          {isUpdatingCategory ? <Spinner /> : <SaveIcon />}
          Save
        </Button>
      </div>
    </div>
  );
}
