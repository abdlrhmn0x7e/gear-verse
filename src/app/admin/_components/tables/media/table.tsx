"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";

// UI & Icons
import { PackageOpenIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";

// Table logic & components
import { mediaColumns } from "./columns";
import { MediaTableHeader } from "./header";
import { type RouterOutputs } from "~/trpc/react";
import { useEffect, useState } from "react";
import { useMediaContext } from "./media-preview-context";
import { cn } from "~/lib/utils";

type Media =
  RouterOutputs["admin"]["media"]["queries"]["getPage"]["data"][number];

export function MediaTable({
  data,
  className,
}: {
  data: Media[];
  className?: string;
}) {
  const { mediaPreviewUrl, rowSelection, setRowSelection } = useMediaContext();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({
    data,
    columns: mediaColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (value) => {
      setRowSelection(value);
    },
    state: {
      rowSelection,
      columnVisibility,
    },
  });

  useEffect(() => {
    if (mediaPreviewUrl) {
      setColumnVisibility((prev) => ({
        ...prev,
        mimeType: false,
        createdAt: false,
      }));
      return;
    }

    setColumnVisibility((prev) => ({
      ...prev,
      mimeType: true,
      createdAt: true,
    }));
  }, [mediaPreviewUrl]);

  return (
    <Table containerClassName={cn("rounded-md", className)}>
      <MediaTableHeader />

      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className="cursor-pointer [&_td]:border-r-0"
              onClick={() => row.toggleSelected()}
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
            <TableCell colSpan={mediaColumns.length} className="text-center">
              <div className="flex flex-col items-center justify-center gap-2 py-32">
                <PackageOpenIcon size={64} />
                <p className="text-lg font-medium">No Orders Found.</p>
                <p className="text-muted-foreground text-sm">
                  What a shame get your ass to work and generate some orders.
                </p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
