"use client";

import { ChevronRightIcon, PowerOffIcon, RadioTowerIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

import type { RouterOutput } from "~/trpc/client";
import { iconsMap } from "~/lib/icons-map";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { ProductsTableActions } from "./actions";
import { PinToggle } from "./pin";
import { Badge } from "~/components/ui/badge";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "~/components/reui/data-grid/data-grid-table";
import { DataGridTableDndRowHandle } from "~/components/reui/data-grid/data-grid-table-dnd-rows";
import type { ListColumn } from "../list-grid";

export type ProductRow =
  RouterOutput["admin"]["products"]["queries"]["getPage"]["data"][number];

export const productColumns: ListColumn<ProductRow>[] = [
  {
    id: "reorder",
    header: () => <span className="sr-only">Reorder</span>,
    enableHiding: false,
    meta: { headerTitle: "Reorder", headerClassName: "w-10" },
    cell: ({ row }) =>
      row.original.pinnedPosition !== null && (
        // the row opens the product drawer, and Enter on the grip clicks it
        <div onClick={(event) => event.stopPropagation()}>
          <DataGridTableDndRowHandle disabledLabel="Clear the filters to reorder" />
        </div>
      ),
  },
  {
    id: "select",
    header: () => <DataGridTableRowSelectAll />,
    cell: ({ row }) => <DataGridTableRowSelect row={row} />,
    enableHiding: false,
    meta: { headerTitle: "Select", headerClassName: "w-10" },
  },
  {
    accessorKey: "id",
    header: "Product No.",
    cell: ({ row }) => {
      return (
        // A real link, so the product can open in a new tab; the row itself
        // opens the product drawer.
        <Button
          variant="link"
          className="h-auto p-0"
          nativeButton={false}
          render={
            <Link
              href={`/admin/products/${row.original.id}`}
              onClick={(event) => event.stopPropagation()}
            />
          }
        >
          # {row.original.id}
        </Button>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Product",
    meta: { headerClassName: "w-full" },
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
            className="shrink-0 bg-white"
            width={40}
            height={40}
          />

          <div className="text-muted-foreground text-sm">
            <p className="text-foreground font-medium whitespace-normal">
              {row.original.title}
            </p>
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
    header: "Brand",
    meta: {
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
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
    header: "Published",
    meta: {
      headerClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
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
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { headerTitle: "Actions", cellClassName: "text-right" },
    cell: ({ row }) => {
      return (
        // The menu portals out, but the trigger's click would still open the
        // row's drawer.
        <div
          className="flex justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <PinToggle
            id={row.original.id}
            pinned={row.original.pinnedPosition !== null}
          />
          <ProductsTableActions
            id={row.original.id}
            slug={row.original.slug}
            published={row.original.published}
          />
        </div>
      );
    },
  },
];
