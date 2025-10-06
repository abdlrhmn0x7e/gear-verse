"use client";

import { CopyIcon, MoreHorizontal, PencilIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DeleteProductDialog } from "../../dialogs/delete-product";
import { PublishProductDialog } from "../../dialogs/publish-product";
import { toast } from "sonner";
import { useState } from "react";

export function ProductsTableActions({
  id,
  published,
}: {
  id: number;
  published: boolean;
}) {
  const [open, setOpen] = useState(false);

  function handleCopyProductLink() {
    void navigator.clipboard.writeText(
      `${window.location.origin}/products/${id}`,
    );
    toast.success("Product link copied to clipboard");
    setOpen(false);
  }

  return (
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
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href={`/admin/products/${id}/edit`}>
              <PencilIcon className="text-muted-foreground" />
              Edit
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleCopyProductLink}
          >
            <CopyIcon />
            Copy Product Link
          </Button>

          <PublishProductDialog
            id={id}
            published={published}
            className="w-full justify-start px-0"
            variant={published ? "destructiveGhost" : "ghost"}
          />

          <DeleteProductDialog
            className="w-full justify-start px-0"
            variant="destructiveGhost"
            id={id}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
