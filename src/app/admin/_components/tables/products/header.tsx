"use client";

import { type Table as ReactTable } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { RouterOutput } from "~/trpc/client";

type ProductRow =
  RouterOutput["admin"]["products"]["queries"]["getPage"]["data"][number];

export function ProductsTableHeader({
  table,
}: {
  table?: ReactTable<ProductRow>;
}) {
  if (!table) {
    return null;
  }

  const allSelectedState = table.getIsAllPageRowsSelected()
    ? true
    : table.getIsSomePageRowsSelected()
      ? "indeterminate"
      : false;

  return (
    <TableHeader className="sticky top-0 pb-1">
      <TableRow>
        <TableHead className="w-10">
          <Checkbox
            checked={allSelectedState}
            aria-label="Select all products"
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            onClick={(event) => event.stopPropagation()}
          />
        </TableHead>
        <TableHead className="w-[200px]">Product No.</TableHead>
        <TableHead>Product</TableHead>
        <TableHead>Brand</TableHead>
        <TableHead>Published</TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
