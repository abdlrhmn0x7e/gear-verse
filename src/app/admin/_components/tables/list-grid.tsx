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
import { DataGridTableDndRows } from "~/components/reui/data-grid/data-grid-table-dnd-rows";
import type { CollisionDetection, DragEndEvent } from "@dnd-kit/core";
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
 * The admin list look, after the reference CRM: on a page the grid takes the
 * whole content region edge to edge and scrolls inside it under a pinned
 * header row, with a stats bar pinned below it. Quiet 12px column labels,
 * 42px rows on hairlines, cells on one line unless a column's own content
 * wraps, and an empty state in place of the grid when there is nothing to
 * show. More rows load as the sentinel under the grid scrolls into view.
 * "inline" drops the scroller and the stats bar, for a list inside a dialog.
 */
export function ListGrid<Row extends object>({
  table,
  isLoading = false,
  isFetching = false,
  onRowClick,
  hasNextPage = false,
  loadMoreRef,
  empty,
  sortable,
  dense = false,
  variant = "page",
  noun = ["row", "rows"],
  stats,
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
  /**
   * Rows that can be dragged, by mouse, touch or keyboard, into a new order
   * through a `DataGridTableDndRowHandle`. Every other row stays in place.
   */
  sortable?: {
    ids: string[];
    onDragEnd: (event: DragEndEvent) => void;
    collisionDetection?: CollisionDetection;
  };
  dense?: boolean;
  variant?: "page" | "inline";
  /** What a top-level row is, singular and plural, for the stats bar's "N in view". */
  noun?: [one: string, other: string];
  /** More stats bar cells after the count, each a `ListStat` or an action. Only numbers the loaded rows already give. */
  stats?: ReactNode;
  className?: string;
}) {
  const rows = table.options.data;
  const page = variant === "page";
  const isEmpty = !isLoading && rows.length === 0;

  const content = isEmpty ? (
    <Empty className={cn(page ? "min-h-full py-16" : "border py-16")}>
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
  ) : (
    <div
      className={cn(
        "transition-opacity",
        isFetching && !isLoading && "opacity-60",
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
          // pinned to the top of the scroller, opaque so rows pass under it
          header: cn(
            "[&_th]:text-muted-foreground [&_th]:h-[38px] [&_th]:text-xs [&_th]:font-normal [&_th]:whitespace-nowrap",
            page &&
              "[&_th]:bg-background [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-t",
          ),
          body: "[&_td]:h-[42px] [&_td]:py-1 [&_td]:whitespace-nowrap [&>tr:last-child>td]:border-b",
          bodyRow:
            "hover:bg-card/60 data-[state=selected]:bg-card transition-[background-color,color] duration-150 ease-out",
        }}
      >
        {/* On a page the scroller below clips and scrolls both ways, so the container mustn't: a clipping box
            between them would also be what the pinned header row sticks to. */}
        <DataGridContainer
          className={page ? "overflow-visible" : "overflow-x-auto"}
        >
          {sortable ? (
            <DataGridTableDndRows
              dataIds={sortable.ids}
              handleDragEnd={sortable.onDragEnd}
              collisionDetection={sortable.collisionDetection}
            />
          ) : (
            <DataGridTable />
          )}
        </DataGridContainer>
      </DataGrid>

      {loadMoreRef && <LoadMore ref={loadMoreRef} hasNextPage={hasNextPage} />}
    </div>
  );

  if (!page) return <div className={className}>{content}</div>;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        {content}
      </div>
      <ListStats>
        {isLoading ? (
          <ListStat>
            <Skeleton className="h-3 w-24" />
          </ListStat>
        ) : (
          <ListStat
            value={`${rows.length}${hasNextPage ? "+" : ""}`}
            label={`${rows.length === 1 && !hasNextPage ? noun[0] : noun[1]} in view`}
          />
        )}
        {!isLoading && stats}
      </ListStats>
    </div>
  );
}

/** The stats bar under a page's list: equal cells split by hairlines. */
function ListStats({ children }: { children: ReactNode }) {
  return (
    // never narrower than its words: on a phone the bar scrolls sideways rather than cutting them off
    <div className="bg-border no-scrollbar grid shrink-0 auto-cols-[minmax(max-content,1fr)] grid-flow-col gap-px overflow-x-auto border-t">
      {children}
    </div>
  );
}

/** One stats bar cell: a figure and what it counts, or anything else (an action) as children. */
export function ListStat({
  value,
  label,
  children,
}: {
  value?: ReactNode;
  label?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="bg-background text-muted-foreground flex h-9 min-w-0 items-center gap-1.5 px-3 text-xs">
      {value !== undefined && (
        <span className="text-foreground tabular-nums">{value}</span>
      )}
      {label && <span className="truncate">{label}</span>}
      {children}
    </div>
  );
}
