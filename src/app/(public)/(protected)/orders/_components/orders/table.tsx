"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// UI & Icons
import { PackageOpenIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";

// Table logic & components
import { useTRPC } from "~/trpc/client";
import { ordersColumns } from "./columns";
import { OrdersTableHeader } from "./header";
import { useOrdersSearchParams } from "../../_hooks/use-orders-search-params";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { LoadMore } from "~/components/load-more";

export function OrdersTable() {
  const [, setParams] = useOrdersSearchParams();
  const trpc = useTRPC();
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    trpc.public.orders.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  const orders = useMemo(() => data.pages.flatMap((page) => page.data), [data]);

  const table = useReactTable({
    data: orders,
    columns: ordersColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="bg-background overflow-hidden rounded-lg border">
      <Table containerClassName="h-fit max-h-[75svh] overflow-y-auto">
        <OrdersTableHeader />

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => setParams({ orderId: row.original.id })}
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
              <TableCell colSpan={ordersColumns.length} className="text-center">
                <div className="flex flex-col items-center justify-center gap-2 py-32">
                  <PackageOpenIcon size={64} />
                  <p className="text-lg font-medium">No Orders Found.</p>
                  <p className="text-muted-foreground text-sm">
                    What a shame get your ass to work and create some
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <LoadMore ref={ref} hasNextPage={hasNextPage} />
      </Table>
    </div>
  );
}
