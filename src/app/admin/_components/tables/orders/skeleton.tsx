"use client";

import { ordersColumns } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

export function OrdersTableSkeleton() {
  const table = useListTable({ data: [], columns: ordersColumns });

  return <ListGrid table={table} isLoading empty={{ title: "" }} />;
}
