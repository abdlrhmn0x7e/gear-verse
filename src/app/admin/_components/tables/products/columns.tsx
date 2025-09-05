"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";

import type { RouterOutputs } from "~/trpc/react";

export const productColumns: ColumnDef<
  RouterOutputs["products"]["getPage"]["data"][0]
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
      return (
        <div className="flex items-center gap-3">
          <div className="size-8 overflow-hidden rounded-sm">
            <Image
              src={row.original.thumbnailUrl ?? ""}
              alt={row.original.title}
              width={40}
              height={40}
              className="size-full object-cover"
            />
          </div>
          <p className="font-medium">{row.original.title}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="size-8 overflow-hidden rounded-sm border">
            <Image
              src={row.original.brand.logo ?? ""}
              alt={row.original.brand.name ?? "Brand Logo"}
              width={40}
              height={40}
              className="size-full object-cover"
            />
          </div>
          <p className="font-medium">{row.original.brand.name}</p>
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
