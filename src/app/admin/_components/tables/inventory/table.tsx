"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { InventoryTableHeader } from "./header";
import type { RouterOutputs } from "~/trpc/react";
import { useInventoryTableColumns } from "./columns";
import type { Control } from "react-hook-form";
import type { InventoryItemFormValues } from "../../forms/inventory-item-form";

export type TableInventoryItem =
  RouterOutputs["admin"]["inventoryItems"]["queries"]["getPage"]["data"][number];

export function InventoryTable({
  data,
  control,
}: {
  data: TableInventoryItem[];
  control: Control<InventoryItemFormValues>;
}) {
  const columns = useInventoryTableColumns(control);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table containerClassName="border rounded-lg bg-background">
      <InventoryTableHeader />

      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
