"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon, PowerOffIcon, RadioTowerIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

import type { RouterOutput } from "~/trpc/client";
import { iconsMap } from "~/lib/icons-map";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { ProductsTableActions } from "./actions";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";

export const productColumns: ColumnDef<
  RouterOutput["admin"]["products"]["queries"]["getPage"]["data"][number]
>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        aria-label="Select all products"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        onClick={(event) => event.stopPropagation()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        aria-label="Select product"
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(event) => event.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
          <ImageWithFallback
            src={row.original.thumbnail?.url}
            alt={row.original.title ?? "Product Thumbnail"}
            className="bg-white"
            width={40}
            height={40}
          />

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
    accessorKey: "brand",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <ImageWithFallback
            src={row.original.brand.logo?.url}
            alt={row.original.brand.name ?? "Brand Logo"}
            width={24}
            height={24}
            className="size-5 rounded-sm"
          />
          <span className="text-sm">{row.original.brand.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "published",
    cell: ({ row }) => {
      if (row.original.published) {
        return (
          <Badge variant="success">
            <RadioTowerIcon />
            WE R LIVE BABY{" "}
          </Badge>
        );
      }

      return (
        <Badge variant="error">
          <PowerOffIcon />
          Get your shit together
        </Badge>
      );
    },
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => {
      return (
        <ProductsTableActions
          id={row.original.id}
          slug={row.original.slug}
          published={row.original.published}
        />
      );
    },
  },
];
