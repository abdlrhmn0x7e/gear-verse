"use client";

import {
  CheckCircleIcon,
  CopyIcon,
  PencilIcon,
  XCircleIcon,
  MoreHorizontal,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
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

export function ProductsTableActions({
  id,
  slug,
  published,
}: {
  id: number;
  slug: string;
  published: boolean;
}) {
  const [open, setOpen] = useState(false);
  const publishDialog = useDialog();
  const deleteDialog = useDialog();

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
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
          <DropdownMenuGroup className="max-w-3xs space-y-1">
            <DropdownMenuItem
              variant="ghost"
              className="w-full justify-start"
              onClick={(e) => e.stopPropagation()}
              asChild
            >
              <Link href={`/admin/products/${id}`}>
                <PencilIcon className="text-muted-foreground" />
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="ghost"
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
            <DropdownMenuItem
              variant="destructive-ghost"
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
