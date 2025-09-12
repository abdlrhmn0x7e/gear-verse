import { MoreHorizontal, PencilIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DeleteProductDialog } from "../../dialogs/delete-product-dialog";
import { PublishProductDialog } from "../../dialogs/publish-product-dialog";

export function ProductsTableActions({
  id,
  published,
}: {
  id: number;
  published: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
        <DropdownMenuGroup className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href={`/admin/products/${id}/edit`}>
              <PencilIcon className="text-muted-foreground" />
              Edit
            </Link>
          </Button>

          <DropdownMenuItem asChild>
            <PublishProductDialog
              id={id}
              published={published}
              className="[&_svg]:text-muted-foreground w-full justify-start px-0"
              variant={published ? "destructiveGhost" : "ghost"}
            />
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <DeleteProductDialog
              className="[&_svg]:text-muted-foreground w-full justify-start px-0"
              variant="destructiveGhost"
              id={id}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
