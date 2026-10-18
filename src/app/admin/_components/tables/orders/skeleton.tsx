"use client";

import { ordersColumns } from "./columns";
import { OrdersFilters } from "./filters";
import { ListGrid, useListTable } from "../list-grid";

export function OrdersTableSkeleton() {
  const table = useListTable({ data: [], columns: ordersColumns });

  return (
    <div className="space-y-4">
      <OrdersFilters />
      <ListGrid table={table} isLoading empty={{ title: "" }} />
    </div>
  );
}
