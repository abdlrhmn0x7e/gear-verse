import { MoreHorizontal, PencilIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function OrdersTableActions({ id }: { id: number }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
        <DropdownMenuGroup className="max-w-3xs space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href={`/admin/products/${id}/edit`}>
              <PencilIcon className="text-muted-foreground" />
              Edit
            </Link>
          </Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
