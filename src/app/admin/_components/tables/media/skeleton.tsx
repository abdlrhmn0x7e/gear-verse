"use client";

import { mediaColumns } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

export function MediaTableSkeleton() {
  const table = useListTable({ data: [], columns: mediaColumns });

  return <ListGrid table={table} isLoading empty={{ title: "" }} />;
}
