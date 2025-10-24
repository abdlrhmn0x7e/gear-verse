"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { InventoryTableHeader } from "./header";
import type { RouterOutput } from "~/trpc/client";
import { useInventoryTableColumns } from "./columns";

export type TableInventoryItem =
  RouterOutput["admin"]["inventoryItems"]["queries"]["getPage"]["data"][number];

export function InventoryTable({ data }: { data: TableInventoryItem[] }) {
  const columns = useInventoryTableColumns();
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
