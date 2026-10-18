"use client";

import type { ForwardedRef } from "react";
import { inventoryColumns, type InventoryRow } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

/**
 * The stock grid. It edits through the surrounding inventory form, whose rows
 * are these rows in the same order.
 */
export function InventoryTable({
  data,
  isFetching,
  hasNextPage,
  loadMoreRef,
  searched,
}: {
  data: InventoryRow[];
  isFetching: boolean;
  hasNextPage: boolean;
  loadMoreRef: ForwardedRef<HTMLDivElement>;
  searched: boolean;
}) {
  const table = useListTable({
    data,
    columns: inventoryColumns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <ListGrid
      table={table}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      loadMoreRef={loadMoreRef}
      empty={
        searched
          ? {
              title: "No items match this search",
              description: "Try a different product name.",
            }
          : {
              title: "No Items Found.",
              description: "What a shame get your ass to work and create some",
            }
      }
    />
  );
}
