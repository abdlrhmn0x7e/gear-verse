"use client";

import {
  type ColumnVisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";

// Table logic & components
import { mediaColumns } from "./columns";
import { type RouterOutput } from "~/trpc/client";
import { cn } from "~/lib/utils";
import { ListGrid, useListTable } from "../list-grid";
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
  // The grid hands a row click only the row, so the shift key is read on the
  // way down instead.
  const shiftKey = useRef(false);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    selectedMedia.reduce((acc, media) => {
      acc[media.mediaId.toString()] = true;
      return acc;
    }, {} as RowSelectionState),
  );

  const table = useListTable({
    data,
    columns: mediaColumns,
    getRowId: (row) => row.id.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: maxFiles
      ? Object.keys(rowSelection).length < maxFiles
      : true,
    onRowSelectionChange: (selection) => {
      setRowSelection(selection);
    },
    state: {
      // hide secondary columns to make room for the preview panel
      columnVisibility: mediaPreviewUrl
        ? { ...columnVisibility, mimeType: false, createdAt: false }
        : columnVisibility,
      rowSelection,
    },
  });

  const handleRowClick = (media: Media) => {
    const rowId = media.id.toString();
    const row = table.getRow(rowId);

    if (maxFiles === 1) {
      setRowSelection({ [rowId]: true });
      return;
    }

    if (shiftKey.current && lastSelectedRowId !== null) {
      const allRowIds = table.getRowModel().rows.map((r) => r.id);
      const startIndex = allRowIds.indexOf(lastSelectedRowId);
      const endIndex = allRowIds.indexOf(rowId);

      const newSelection = { ...rowSelection };
      const [start, end] =
        startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

      for (let i = start; i <= end; i++) {
        newSelection[allRowIds[i]!] = true;
      }
      setRowSelection(newSelection);
    } else {
      row.toggleSelected(); // TanStack's built-in toggle
      setLastSelectedRowId(rowId);
    }
  };

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
    <div
      className="contents"
      onClickCapture={(event) => {
        shiftKey.current = event.shiftKey;
      }}
    >
      <ListGrid
        table={table}
        onRowClick={handleRowClick}
        className={cn("select-none", className)}
        empty={{ title: "No media found." }}
      />
    </div>
  );
}
