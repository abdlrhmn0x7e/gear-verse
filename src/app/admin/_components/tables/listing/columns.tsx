import { IconPackageOff } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DollarSignIcon, Package2Icon } from "lucide-react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import type { RouterOutputs } from "~/trpc/react";

export const listingColumns: ColumnDef<
  RouterOutputs["listing"]["queries"]["getPage"]["data"][0]
>[] = [
  {
    accessorKey: "id",
    header: "Listing No.",
    cell: ({ row }) => {
      return (
        <Button variant="link" className="p-0">
          # {row.original.id}
        </Button>
      );
    },
  },
  {
    id: "title",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="size-6 overflow-hidden rounded-sm border">
          <Image
            src={row.original.thumbnail?.url ?? ""}
            alt={row.original.title}
            width={24}
            height={24}
            className="size-full object-cover"
          />
        </div>
        <p className="font-medium">{row.original.title}</p>
      </div>
    ),
  },
  {
    id: "price",
    cell: ({ row }) => (
      <div className="flex items-center">
        <DollarSignIcon className="size-4" />
        <p className="font-medium">{row.original.price}</p>
      </div>
    ),
  },
  {
    id: "stock",
    cell: ({ row }) => {
      if (row.original.stock === 0) {
        return (
          <div className="flex items-center gap-2">
            <IconPackageOff className="text-destructive size-4" />
            <p className="text-destructive font-medium">Out of stock</p>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Package2Icon className="size-4" />
          <p className="font-medium">{row.original.stock}</p>
        </div>
      );
    },
  },
];
