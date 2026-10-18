"use client";

import { productColumns } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

export function ProductsTableSkeleton() {
  const table = useListTable({ data: [], columns: productColumns });

  return <ListGrid table={table} isLoading empty={{ title: "" }} />;
}
