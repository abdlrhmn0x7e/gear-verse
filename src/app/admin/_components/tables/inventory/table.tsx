"use client";

import type { ForwardedRef } from "react";
import { inventoryColumns, type InventoryNode } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

/**
 * The stock grid, a row per product with its variants nested under it. It
 * edits through the surrounding inventory form, whose rows are the item nodes.
 */
export function InventoryTable({
  data,
  isFetching,
  hasNextPage,
  loadMoreRef,
  searched,
}: {
  data: InventoryNode[];
  isFetching: boolean;
  hasNextPage: boolean;
  loadMoreRef: ForwardedRef<HTMLDivElement>;
  searched: boolean;
}) {
  const table = useListTable({
    data,
    columns: inventoryColumns,
    getRowId: (node) => node.key,
    getSubRows: (node) => (node.kind === "group" ? node.variants : undefined),
    // open groups stay open as pages load and after a save's refetch
    autoResetExpanded: false,
  });

  return (
    <ListGrid
      table={table}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      loadMoreRef={loadMoreRef}
      onRowClick={(node) => {
        if (node.kind === "group") table.getRow(node.key).toggleExpanded();
      }}
      // only a group row does anything on click
      className="[&_tbody_tr:not(:has(button[aria-expanded]))]:cursor-auto"
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
