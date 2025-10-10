"use client";

import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Spinner } from "~/components/spinner";
import { toast } from "sonner";

export function CategoryTreeActions({
  categoryId,
  setShowAddForm,
  setShowEditForm,
}: {
  categoryId: number;
  setShowAddForm: (show: boolean) => void;
  setShowEditForm: (show: boolean) => void;
}) {
  const utils = api.useUtils();
  const { mutate: deleteCategory, isPending: isDeletingCategory } =
    api.admin.categories.mutations.delete.useMutation({
      onSuccess: () => {
        void utils.admin.categories.queries.findAll.invalidate();
      },
      onError: () => {
        toast.error(
          "This category has products, please remove/move them first",
        );
      },
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="order-last ml-auto cursor-pointer p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:outline-none data-[state=open]:opacity-100">
        <EllipsisVerticalIcon className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={20}
        alignOffset={-8}
      >
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowAddForm(true)}>
          <PlusIcon />
          Add a Sub-Category
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setShowEditForm(true)}>
          <PencilIcon />
          Edit Category
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          onClick={() => deleteCategory({ id: categoryId })}
        >
          {isDeletingCategory ? <Spinner /> : <TrashIcon />}
          Remove Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
