"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { api } from "~/trpc/react";
import { productColumns } from "./columns";
import { useRouter } from "next/navigation";
import { ProductsTableHeader } from "./header";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export function ProductsTable() {
  const [products] = api.products.findAll.useSuspenseQuery();
  const router = useRouter();

  const table = useReactTable({
    data: products,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="py-4">
      <CardHeader>hello</CardHeader>
      <CardContent className="px-4">
        <div className="bg-background overflow-hidden rounded-md border">
          <Table containerClassName="scroll-shadow max-h-[70svh] overflow-y-auto">
            <ProductsTableHeader />

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() =>
                      router.push(`/admin/products/${row.original.id}`)
                    }
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={productColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
