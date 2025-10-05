"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// React & Next
import { useEffect, useMemo } from "react";

// Third-party hooks & utilities
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

// UI & Icons
import { PackageOpenIcon } from "lucide-react";
import { Spinner } from "~/components/spinner";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";

// Custom hooks
import { useDebounce } from "~/hooks/use-debounce";
import { useOrderSearchParams } from "../../../_hooks/use-order-search-params";

// Table logic & components
import { api } from "~/trpc/react";
import { ordersColumns } from "./columns";
import { OrdersTableHeader } from "./header";
import { OrdersTableSkeleton } from "./skeleton";
import { OrdersFilter } from "./filters";
import { cn } from "~/lib/utils";

export function OrdersTable() {
  const utils = api.useUtils();
  const [params, setParams] = useOrderSearchParams();
  const debouncedFilters = useDebounce(params);
  const {
    data: orders,
    isPending,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    utils.admin.orders.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
        filters: {
          orderId: debouncedFilters.search ?? undefined,
          status: debouncedFilters.status ?? undefined,
          paymentMethod: debouncedFilters.paymentMethod ?? undefined,
        },
      },
      {
        placeholderData: keepPreviousData,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  const ordersData = useMemo(
    () => orders?.pages.flatMap((page) => page.data) ?? [],
    [orders],
  );

  const { ref, inView } = useInView();

  const table = useReactTable({
    data: ordersData,
    columns: ordersColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (isPending) {
    return <OrdersTableSkeleton />;
  }

  return (
    <Card className="gap-2 py-2">
      <CardHeader className="px-2">
        <OrdersFilter />
      </CardHeader>

      <CardContent className="px-2">
        <div
          className={cn(
            "bg-background overflow-hidden rounded-lg border transition-opacity",
            isFetching && "opacity-75",
          )}
        >
          <Table containerClassName="h-fit max-h-[75svh] overflow-y-auto">
            <OrdersTableHeader />

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() =>
                      setParams({ ...params, orderId: row.original.id })
                    }
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={ordersColumns.length}
                    className="text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-32">
                      <PackageOpenIcon size={64} />
                      <p className="text-lg font-medium">No Orders Found.</p>
                      <p className="text-muted-foreground text-sm">
                        What a shame get your ass to work and generate some
                        orders.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {hasNextPage && (
              <div className="flex items-center justify-center p-4" ref={ref}>
                <Spinner />
              </div>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
