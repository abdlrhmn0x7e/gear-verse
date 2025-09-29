"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon, PowerOffIcon, RadioTowerIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

import type { RouterOutputs } from "~/trpc/react";
import { iconsMap } from "~/lib/icons-map";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { ProductsTableActions } from "./actions";
import { Badge } from "~/components/ui/badge";

export const productColumns: ColumnDef<
  RouterOutputs["admin"]["products"]["queries"]["getPage"]["data"][number]
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
          <ImageWithFallback
            src={row.original.thumbnail?.url}
            alt={row.original.title ?? "Product Thumbnail"}
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
          published={row.original.published}
        />
      );
    },
  },
];
