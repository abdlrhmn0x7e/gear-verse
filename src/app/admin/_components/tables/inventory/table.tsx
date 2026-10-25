"use client";

import type { ForwardedRef } from "react";
import { inventoryColumns, stockStatus, type InventoryNode } from "./columns";
import { ListGrid, ListStat, useListTable } from "../list-grid";

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

  // every stock row loaded, by its saved quantity
  const stock = data
    .flatMap((node) => (node.kind === "group" ? node.variants : [node]))
    .map((node) => stockStatus(node.item.quantity).variant);

  return (
    <ListGrid
      table={table}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      loadMoreRef={loadMoreRef}
      noun={["product", "products"]}
      stats={
        <>
          <ListStat value={stock.length} label="stock rows" />
          <ListStat
            value={stock.filter((status) => status === "error").length}
            label="out of stock"
          />
          <ListStat
            value={stock.filter((status) => status === "warning").length}
            label="low stock"
          />
        </>
      }
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
