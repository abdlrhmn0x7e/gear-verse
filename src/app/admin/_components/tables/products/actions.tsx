"use client";

import { CopyIcon, MoreHorizontal, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DeleteProductDialog } from "../../dialogs/delete-product";
import { PublishProductDialog } from "../../dialogs/publish-product";

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

  function handleCopyProductLink() {
    void navigator.clipboard.writeText(
      `${window.location.origin}/products/${slug}`,
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
            <Link href={`/admin/products/${id}`}>
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
            className="w-full justify-start"
            variant="ghost"
          />

          <DeleteProductDialog
            className="w-full justify-start"
            variant="destructive-ghost"
            id={id}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
