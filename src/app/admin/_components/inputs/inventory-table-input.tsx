"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field } from "~/components/ui/field";
import { NumberInput } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { InventoryItem } from "~/lib/schemas/entities/inventory-item";

type TableInventoryItem = Omit<
  InventoryItem,
  "productId" | "productVariantId" | "createdAt" | "updatedAt"
>;

export function InventoryTableInput({ data }: { data: TableInventoryItem[] }) {
  const form = useFormContext<{ inventory: InventoryItem }>();

  const columns = useMemo<ColumnDef<TableInventoryItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Item No.",
        cell: ({ row }) => {
          return <span># {row.original.id}</span>;
        },
      },
      {
        accessorKey: "",
        header: "Location",
        cell: "Your basement",
      },
      {
        accessorKey: "quantity",
        header: "Available",
        cell: () => {
          return (
            <Controller
              control={form.control}
              name={`inventory.quantity`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <NumberInput
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="How much you got?"
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                    value={field.value}
                  />
                </Field>
              )}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table containerClassName="border rounded-lg">
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className="[&_th]:border-r-0">
            {group.headers.map((header) => (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                className="w-full"
                style={{
                  width: `${header.column.getSize()}px`,
                  minWidth: `${header.column.getSize()}px`,
                  maxWidth: `${header.column.getSize()}px`,
                }}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
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
