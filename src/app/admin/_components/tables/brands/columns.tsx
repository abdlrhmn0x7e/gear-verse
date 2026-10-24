"use client";

import { ImageWithFallback } from "~/components/image-with-fallback";
import type { RouterOutput } from "~/trpc/client";
import type { ListColumn } from "../list-grid";
import { BrandsTableActions } from "./actions";

export type BrandRow =
  RouterOutput["admin"]["brands"]["queries"]["getPage"]["data"][number];

export const brandsColumns: ListColumn<BrandRow>[] = [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <ImageWithFallback
          src={row.original.logo?.url}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-sm border bg-white [&_img]:object-contain"
        />
        <span className="truncate font-medium">{row.original.name}</span>
      </div>
    ),
    meta: { headerClassName: "w-full" },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.slug}
      </span>
    ),
    meta: {
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
  },
  {
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => <span>{row.original.productCount}</span>,
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right tabular-nums",
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <BrandsTableActions brand={row.original} />,
    meta: { headerTitle: "Actions", cellClassName: "text-right" },
  },
];
