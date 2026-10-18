"use client";

import {
  useTable,
  type ColumnDef,
  type RowData,
  type TableOptions,
} from "@tanstack/react-table";
import type { ForwardedRef, ReactNode } from "react";
import { useMemo } from "react";
import { PackageOpenIcon } from "lucide-react";

import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
  type DataGridFeatures,
  type DataGridTableInstance,
} from "~/components/reui/data-grid/data-grid";
import { DataGridTable } from "~/components/reui/data-grid/data-grid-table";
import { LoadMore } from "~/components/load-more";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export type ListColumn<Row extends RowData> = ColumnDef<DataGridFeatures, Row>;

/**
 * A table for an admin list, every loaded row in server order. Search,
 * filters and paging happen on the server, so the table neither slices nor
 * sorts what it is given. While the first page loads, every column shows a
 * placeholder bar.
 */
export function useListTable<Row extends object>(
  options: Omit<TableOptions<DataGridFeatures, Row>, "features" | "columns"> & {
    columns: ListColumn<Row>[];
  },
) {
  const { columns } = options;
  const withSkeletons = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        meta: {
          skeleton: <Skeleton className="h-4 w-full min-w-8" />,
          ...column.meta,
        },
      })),
    [columns],
  );

  return useTable({
    ...options,
    features: dataGridFeatures,
    columns: withSkeletons,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });
}

/**
 * The admin list look: quiet column labels, cells on one line unless a
 * column's own content wraps, and an empty state in place of the grid when
 * there is nothing to show. More rows load as the sentinel under the grid
 * scrolls into view.
 */
export function ListGrid<Row extends object>({
  table,
  isLoading = false,
  isFetching = false,
  onRowClick,
  hasNextPage = false,
  loadMoreRef,
  empty,
  dense = false,
  className,
}: {
  table: DataGridTableInstance<Row>;
  isLoading?: boolean;
  /** A refetch for new filters: the current rows dim until it lands. */
  isFetching?: boolean;
  onRowClick?: (row: Row) => void;
  hasNextPage?: boolean;
  loadMoreRef?: ForwardedRef<HTMLDivElement>;
  empty: { title: string; description?: ReactNode; icon?: ReactNode };
  dense?: boolean;
  className?: string;
}) {
  const rows = table.options.data;

  if (!isLoading && rows.length === 0) {
    return (
      <Empty className={cn("border py-16", className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {empty.icon ?? <PackageOpenIcon />}
          </EmptyMedia>
          <EmptyTitle>{empty.title}</EmptyTitle>
          {empty.description && (
            <EmptyDescription>{empty.description}</EmptyDescription>
          )}
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div
      className={cn(
        "transition-opacity",
        isFetching && !isLoading && "opacity-60",
        className,
      )}
    >
      <DataGrid
        table={table}
        recordCount={rows.length}
        isLoading={isLoading}
        loadingMode="skeleton"
        onRowClick={onRowClick}
        tableLayout={{ width: "auto", headerBorder: true, dense }}
        tableClassNames={{
          header:
            "[&_th]:font-medium [&_th]:whitespace-nowrap [&_th]:text-muted-foreground",
          body: "[&_td]:whitespace-nowrap",
        }}
      >
        <DataGridContainer className="overflow-x-auto">
          <DataGridTable />
        </DataGridContainer>
      </DataGrid>

      {loadMoreRef && <LoadMore ref={loadMoreRef} hasNextPage={hasNextPage} />}
    </div>
  );
}
