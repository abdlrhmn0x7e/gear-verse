"use client";

import { ListGrid, useListTable } from "../list-grid";
import { brandsColumns } from "./columns";

export function BrandsTableSkeleton() {
  const table = useListTable({ data: [], columns: brandsColumns });

  return <ListGrid table={table} isLoading empty={{ title: "" }} />;
}
