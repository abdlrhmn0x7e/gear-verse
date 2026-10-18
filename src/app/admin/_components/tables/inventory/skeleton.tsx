"use client";

import { inventoryColumns } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

export function InventoryTableSkeleton() {
  const table = useListTable({ data: [], columns: inventoryColumns });

  return <ListGrid table={table} isLoading empty={{ title: "" }} />;
}
