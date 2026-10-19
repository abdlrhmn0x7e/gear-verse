"use client";

import {
  CheckCircleIcon,
  CopyIcon,
  PencilIcon,
  XCircleIcon,
  MoreHorizontal,
  TrashIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "~/components/ui/toast";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DeleteProductDialog } from "../../dialogs/delete-product";
import { PublishProductDialog } from "../../dialogs/publish-product";
import { useDialog } from "~/hooks/use-dialog";
import { useTRPC } from "~/trpc/client";

export function ProductsTableActions({
  id,
  slug,
  published,
  trending,
}: {
  id: number;
  slug: string;
  published: boolean;
  trending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const publishDialog = useDialog();
  const deleteDialog = useDialog();

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: updateProduct } = useMutation(
    trpc.admin.products.mutations.editDeep.mutationOptions(),
  );

  function handleToggleTrending(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    updateProduct(
      { id, data: { trending: !trending } },
      {
        onSuccess: () => {
          toast.success(
            trending ? "No longer trending" : "Marked as trending",
          );
          void queryClient.invalidateQueries(
            trpc.admin.products.queries.getPage.infiniteQueryFilter(),
          );
        },
        onError: () => {
          toast.error("Failed to update product");
        },
      },
    );
  }

  function handleCopyProductLink(e: React.MouseEvent) {
    e.stopPropagation();
    void navigator.clipboard.writeText(
      `${window.location.origin}/products/${slug}`,
    );
    toast.success("Product link copied to clipboard");
    setOpen(false);
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Open menu" />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuGroup className="max-w-3xs space-y-1">
            <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="w-full justify-start"
              onClick={(e) => e.stopPropagation()}
              render={<Link href={`/admin/products/${id}`} />}
            >
              <PencilIcon className="text-muted-foreground" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="w-full justify-start"
              onClick={handleCopyProductLink}
            >
              <CopyIcon />
              Copy Product Link
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                publishDialog.trigger();
              }}
            >
              {!published ? <CheckCircleIcon /> : <XCircleIcon />}
              {published ? "Unpublish product" : "Publish product"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleTrending}>
              {trending ? <TrendingDownIcon /> : <TrendingUpIcon />}
              {trending ? "Stop trending" : "Mark as trending"}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteDialog.trigger();
              }}
            >
              <TrashIcon /> Delete Product
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProductDialog id={id} {...deleteDialog.props} />

      <PublishProductDialog
        id={id}
        published={published}
        {...publishDialog.props}
      />
    </>
  );
}
