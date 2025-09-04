"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useInView } from "react-intersection-observer";

import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { api } from "~/trpc/react";
import { productColumns } from "./columns";
import { useRouter } from "next/navigation";
import { ProductsTableHeader } from "./header";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Spinner } from "~/components/spinner";
import { useEffect } from "react";
import { SearchInput } from "../../inputs/search-input";
import { parseAsString, useQueryState } from "nuqs";
import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";

export function ProductsTable() {
  const [title] = useQueryState(
    "title",
    parseAsString.withOptions({
      shallow: true,
    }),
  );
  const utils = api.useUtils();

  const {
    data: products,
    fetchNextPage,
    hasNextPage,
  } = useSuspenseInfiniteQuery(
    utils.products.getPage.infiniteQueryOptions(
      {
        title,
        pageSize: 10,
      },
      {
        placeholderData: keepPreviousData,
        getNextPageParam(lastPage) {
          return lastPage.nextCursor;
        },
      },
    ),
  );

  const router = useRouter();
  const { ref, inView } = useInView();
  const productsData = products?.pages.flatMap((page) => page.data);

  const table = useReactTable({
    data: productsData,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <Card className="gap-1 py-2">
      <CardHeader className="px-2">
        <SearchInput className="max-w-xs" />
      </CardHeader>

      <CardContent className="px-2">
        <div className="bg-background overflow-hidden rounded-md border">
          <Table containerClassName="scroll-shadow max-h-[70svh] overflow-y-auto">
            <ProductsTableHeader />

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() =>
                      router.push(`/admin/products/${row.original.id}`)
                    }
                    data-state={row.getIsSelected() && "selected"}
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
                    colSpan={productColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}

              {hasNextPage && (
                <div className="flex items-center justify-center p-4" ref={ref}>
                  <Spinner />
                </div>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
