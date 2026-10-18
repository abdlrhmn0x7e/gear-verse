"use client";

import { usersColumns } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

export function UsersTableSkeleton() {
  const table = useListTable({ data: [], columns: usersColumns });

  return <ListGrid table={table} isLoading empty={{ title: "" }} />;
}
