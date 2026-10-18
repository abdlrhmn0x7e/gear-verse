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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Spinner } from "~/components/spinner";
import { toast } from "~/components/ui/toast";
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
      <DropdownMenuTrigger
        aria-label="Category actions"
        className="text-muted-foreground hover:text-foreground order-last flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none data-popup-open:opacity-100"
      >
        <EllipsisVerticalIcon className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        className="max-w-64"
        sideOffset={20}
        alignOffset={-8}
      >
        <DropdownMenuGroup>
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
