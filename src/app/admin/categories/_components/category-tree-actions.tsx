"use client";

import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useTRPC } from "~/trpc/client";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function CategoryTreeActions({
  categoryId,
  setShowAddForm,
  setShowEditForm,
}: {
  categoryId: number;
  setShowAddForm: (show: boolean) => void;
  setShowEditForm: (show: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: deleteCategory, isPending: isDeletingCategory } = useMutation(
    trpc.admin.categories.mutations.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findAll.queryFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findRoots.queryFilter(),
        );
        toast.success("Category deleted successfully");
      },
      onError: () => {
        toast.error(
          "This category has products, please remove/move them first",
        );
      },
    }),
  );

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
