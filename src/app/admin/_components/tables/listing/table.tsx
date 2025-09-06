"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { ListingsTableHeader } from "./header";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { listingColumns } from "./columns";
import { useInView } from "react-intersection-observer";
import { IconShoppingBagX } from "@tabler/icons-react";
import { Spinner } from "~/components/spinner";
import { ListingsTableSkeleton } from "./skeleton";
import { ListingsTableFilters } from "./filters";
import { useListingSearchParams } from "./hooks";
import { useDebounce } from "~/hooks/use-debounce";

export function ListingsTable() {
  const [params, setParams] = useListingSearchParams();
  const titleFilter = useDebounce(params.title);
  const { data, isFetching, hasNextPage, fetchNextPage } =
    api.listing.queries.getPage.useInfiniteQuery(
      {
        pageSize: 10,
        filters: {
          title: titleFilter ?? undefined,
        },
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const listingsData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const table = useReactTable({
    data: listingsData,
    columns: listingColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isFetching) {
    return <ListingsTableSkeleton />;
  }

  return (
    <Card className="gap-2 py-2">
      <CardHeader className="px-2">
        <ListingsTableFilters />
      </CardHeader>

      <CardContent className="px-2">
        <div className="bg-background overflow-hidden rounded-md border">
          <Table>
            <ListingsTableHeader />
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                    onClick={() => {
                      void setParams({
                        ...params,
                        listingId: row.original.id,
                      });
                    }}
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
                    colSpan={listingColumns.length}
                    className="text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-32">
                      <IconShoppingBagX size={64} />
                      <p className="text-lg font-medium">No Listings Found.</p>
                      <p className="text-muted-foreground text-sm">
                        What a shame get your ass to work and create some
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
