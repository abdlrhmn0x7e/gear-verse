"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { InventoryTableHeader } from "./header";
import { useInventoryTableColumns } from "./columns";

import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { useTRPC } from "~/trpc/client";
import { useDebounce } from "~/hooks/use-debounce";
import { LoadMore } from "~/components/load-more";
import { PackageOpenIcon } from "lucide-react";

export function InventoryTable() {
  const [params] = useInventorySearchParams();
  const trpc = useTRPC();
  const debouncedFilters = useDebounce(params);
  const {
    data: items,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.admin.inventoryItems.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 15,
        filters: {
          inventorySearch: debouncedFilters.inventorySearch ?? undefined,
        },
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: keepPreviousData,
      },
    ),
  );
  const data = useMemo(() => items.pages.flatMap((page) => page.data), [items]);
  console.log("InventoryTable render with items:", data);

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const columns = useInventoryTableColumns();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table containerClassName="border rounded-lg bg-background h-fit max-h-[75svh] overflow-y-auto pb-24">
      <InventoryTableHeader />

      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className="cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              <div className="flex flex-col items-center justify-center gap-2 py-32">
                <PackageOpenIcon size={64} />
                <p className="text-lg font-medium">No Items Found.</p>
                <p className="text-muted-foreground text-sm">
                  What a shame get your ass to work and create some
                </p>
              </div>
            </TableCell>
          </TableRow>
        )}
        <TableRow>
          <TableCell colSpan={columns.length}>
            <div className="flex flex-col items-center justify-center">
              <LoadMore ref={ref} hasNextPage={hasNextPage} />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
