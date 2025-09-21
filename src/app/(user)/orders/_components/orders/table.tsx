"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// UI & Icons
import { PackageOpenIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";

// Table logic & components
import { type RouterOutputs } from "~/trpc/react";
import { ordersColumns } from "./columns";
import { OrdersTableHeader } from "./header";
import { useOrdersSearchParams } from "../../_hooks/use-orders-search-params";

export function OrdersTable({
  orders,
}: {
  orders: RouterOutputs["user"]["orders"]["findAll"];
}) {
  const [, setParams] = useOrdersSearchParams();

  const table = useReactTable({
    data: orders,
    columns: ordersColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-background overflow-hidden rounded-lg border">
      <Table containerClassName="h-fit max-h-[75svh] overflow-y-auto">
        <OrdersTableHeader />

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => setParams({ orderId: row.original.id })}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={ordersColumns.length} className="text-center">
                <div className="flex flex-col items-center justify-center gap-2 py-32">
                  <PackageOpenIcon size={64} />
                  <p className="text-lg font-medium">No Orders Found.</p>
                  <p className="text-muted-foreground text-sm">
                    What a shame get your ass to work and create some
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
