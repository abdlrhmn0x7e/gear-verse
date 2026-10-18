"use client";

import { useInventoryTableColumns } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

export function InventoryTableSkeleton() {
  const columns = useInventoryTableColumns();
  const table = useListTable({ data: [], columns });

  return <ListGrid table={table} isLoading empty={{ title: "" }} />;
}
