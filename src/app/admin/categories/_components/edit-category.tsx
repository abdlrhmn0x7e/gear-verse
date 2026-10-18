"use client";

import { Button } from "~/components/ui/button";
import {
  CategoryForm,
  type CategoryFormValues,
} from "~/app/admin/_components/forms/category-form";
import { SaveIcon, XIcon } from "lucide-react";
import { useTRPC } from "~/trpc/client";
import { Spinner } from "~/components/spinner";
import { useEffect, useId } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "~/components/ui/toast";

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
  const formId = useId();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: updateCategory, isPending: isUpdatingCategory } = useMutation(
    trpc.admin.categories.mutations.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findAll.queryFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findRoots.queryFilter(),
        );
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't save the category");
      },
    }),
  );

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
        formId={formId}
      />

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={cancel}>
          <XIcon data-icon="inline-start" />
          Cancel
        </Button>

        <Button type="submit" form={formId} disabled={isUpdatingCategory}>
          {isUpdatingCategory ? (
            <Spinner size="small" data-icon="inline-start" />
          ) : (
            <SaveIcon data-icon="inline-start" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}
