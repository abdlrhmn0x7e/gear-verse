"use client";

import { DeleteProductDialog } from "@admin/_components/dialogs/delete-product";
import { PublishProductDialog } from "@admin/_components/dialogs/publish-product";
import { useProductSearchParams } from "@admin/_hooks/use-product-search-params";
import {
  ArrowUpRightIcon,
  CopyIcon,
  EllipsisIcon,
  PencilIcon,
  PowerOffIcon,
  RadioTowerIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "~/components/ui/toast";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useDialog } from "~/hooks/use-dialog";
import { cn } from "~/lib/utils";

export function ProductSummaryActions({
  id,
  slug,
  published,
}: {
  id: number;
  slug: string;
  published: boolean;
}) {
  const router = useRouter();
  const [, setParams] = useProductSearchParams();
  const publishDialog = useDialog();
  const deleteDialog = useDialog();
  const storePath = `/products/${slug}`;

  function handleCopyLink() {
    void navigator.clipboard.writeText(`${window.location.origin}${storePath}`);
    toast.success("Product link copied to clipboard");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon" aria-label="More actions" />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" side="top">
          <DropdownMenuItem onClick={handleCopyLink}>
            <CopyIcon />
            Copy product link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={publishDialog.trigger}>
            {published ? <PowerOffIcon /> : <RadioTowerIcon />}
            {published ? "Unpublish product" : "Publish product"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={deleteDialog.trigger}
          >
            <Trash2Icon />
            Delete product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* drafts 404 on the store, so there is nothing to view yet */}
      {published && (
        <Button variant="outline" className="ms-auto max-sm:flex-1" asChild>
          <Link href={storePath} target="_blank" rel="noopener">
            View on store
            <ArrowUpRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      )}

      {/* on a phone the three don't fit one row, so Edit wraps to a full-width row of its own */}
      <Button className={cn("max-sm:flex-1", !published && "ms-auto")} asChild>
        <Link href={`/admin/products/${id}`}>
          <PencilIcon data-icon="inline-start" />
          Edit product
        </Link>
      </Button>

      <PublishProductDialog
        id={id}
        published={published}
        onPublishSuccess={() => router.refresh()}
        {...publishDialog.props}
      />

      <DeleteProductDialog
        id={id}
        onDeleteSuccess={() => void setParams({ id: null, slug: null })}
        {...deleteDialog.props}
      />
    </>
  );
}
