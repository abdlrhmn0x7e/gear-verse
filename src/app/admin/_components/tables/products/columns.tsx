"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";

import type { RouterOutputs } from "~/trpc/react";
import { iconsMap } from "~/lib/icons-map";

export const productColumns: ColumnDef<
  RouterOutputs["products"]["getPage"]["data"][number]
>[] = [
  {
    accessorKey: "id",
    header: "Product No.",
    cell: ({ row }) => {
      return (
        <Button variant="link" className="p-0" asChild>
          <Link href={`/admin/products/${row.original.id}`}>
            # {row.original.id}
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "title",
    cell: ({ row }) => {
      const ParentIcon = row.original.category.parent
        ? iconsMap.get(row.original.category.parent.icon)
        : null;
      const CategoryIcon = iconsMap.get(row.original.category.icon);
      return (
        <div className="flex items-center gap-3">
          <div className="size-8 overflow-hidden rounded-sm border">
            <Image
              src={row.original.brand.logo.url ?? ""}
              alt={row.original.brand.name ?? "Brand Logo"}
              width={40}
              height={40}
              className="size-full object-cover"
            />
          </div>
          <div className="text-muted-foreground text-sm">
            <p className="font-medium">{row.original.title}</p>
            <div className="flex items-center gap-1">
              {row.original.category.parent && (
                <>
                  {ParentIcon ? <ParentIcon className="size-4" /> : null}
                  <p className="text-muted-foreground text-sm">
                    {row.original.category.parent.name}
                  </p>
                  <ChevronRightIcon className="size-4" />
                </>
              )}
              {CategoryIcon ? <CategoryIcon className="size-4" /> : null}
              <p className="text-muted-foreground text-sm">
                {row.original.category.name}
              </p>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          {format(row.original.createdAt, "dd MMM, yyyy HH:mm a")}
        </div>
      );
    },
  },
];
