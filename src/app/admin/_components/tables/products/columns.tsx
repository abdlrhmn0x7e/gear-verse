"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import type { Product } from "~/lib/schemas/product";

export const productColumns: ColumnDef<
  Omit<Product, "description" | "thumbnailMediaId" | "categoryId" | "brandId">
>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return (
        <Button className="p-0" variant="link" asChild>
          <Link href={`/admin/products/${row.original.id}`}>
            # {row.original.id}
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },

  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          <p>{row.original.createdAt.toLocaleDateString()}</p>
        </div>
      );
    },
  },
];
