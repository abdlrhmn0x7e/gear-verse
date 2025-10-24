"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";

// UI & Icons
import { PackageOpenIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";

// Table logic & components
import { mediaColumns } from "./columns";
import { MediaTableHeader } from "./header";
import { type RouterOutput } from "~/trpc/client";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { useMediaStore } from "../../../_stores/media/provider";

type Media =
  RouterOutput["admin"]["media"]["queries"]["getPage"]["data"][number];

export function MediaTable({
  data,
  className,
}: {
  data: Media[];
  className?: string;
}) {
  const mediaPreviewUrl = useMediaStore((state) => state.previewUrl);
  const setSelectedMedia = useMediaStore((state) => state.setSelectedMedia);
  const selectedMedia = useMediaStore((state) => state.selectedMedia);
  const maxFiles = useMediaStore((state) => state.maxFiles);

  const [lastSelectedRowId, setLastSelectedRowId] = useState<string | null>(
    null,
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    selectedMedia.reduce((acc, media) => {
      acc[media.mediaId.toString()] = true;
      return acc;
    }, {} as RowSelectionState),
  );

  const table = useReactTable({
    data,
    columns: mediaColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: maxFiles
      ? Object.keys(rowSelection).length < maxFiles
      : true,
    onRowSelectionChange: (selection) => {
      setRowSelection(selection);
    },
    state: {
      columnVisibility,
      rowSelection,
    },
  });

  const handleRowClick = (row: Row<Media>, event: React.MouseEvent) => {
    if (maxFiles === 1) {
      setRowSelection({ [row.id.toString()]: true });
      return;
    }

    if (event.shiftKey && lastSelectedRowId !== null) {
      const allRowIds = table.getRowModel().rows.map((r) => r.id);
      const startIndex = allRowIds.indexOf(lastSelectedRowId);
      const endIndex = allRowIds.indexOf(row.id);

      const newSelection = { ...rowSelection };
      const [start, end] =
        startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

      for (let i = start; i <= end; i++) {
        newSelection[allRowIds[i]!] = true;
      }
      setRowSelection(newSelection);
    } else {
      row.toggleSelected(); // TanStack's built-in toggle
      setLastSelectedRowId(row.id);
    }
  };

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

  useEffect(() => {
    setSelectedMedia(
      table.getSelectedRowModel().rows.map((row, index) => ({
        mediaId: row.original.id,
        url: row.original.url,
        order: index + 1,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  return (
    <Table containerClassName={cn("rounded-md select-none", className)}>
      <MediaTableHeader />

      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className="cursor-pointer [&_td]:border-r-0"
              onClick={(event) => {
                handleRowClick(row, event);
              }}
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
