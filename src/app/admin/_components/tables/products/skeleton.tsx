"use client";

import { productColumns } from "./columns";
import { ProductsFilters } from "./filters";
import { ListGrid, useListTable } from "../list-grid";

export function ProductsTableSkeleton() {
  const table = useListTable({ data: [], columns: productColumns });

  return (
    <div className="space-y-4">
      <ProductsFilters />
      <ListGrid table={table} isLoading empty={{ title: "" }} />
    </div>
  );
}
