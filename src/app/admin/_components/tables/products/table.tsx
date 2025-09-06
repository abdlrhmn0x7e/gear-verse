"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { ProductsTableHeader } from "./header";
import { productColumns } from "./columns";
import { api } from "~/trpc/react";
import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { Spinner } from "~/components/spinner";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { PackageOpenIcon } from "lucide-react";
import { ProductsFilter } from "./filters";
import { useProductsFilterParams } from "./hooks";

export function ProductsTable() {
  const [filters] = useProductsFilterParams();
  const utils = api.useUtils();
  const {
    data: products,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    utils.products.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
        filters: {
          title: filters.title ?? undefined,
          brands: filters.brands ?? undefined,
        },
      },
      {
        placeholderData: keepPreviousData,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
  const productsData = useMemo(
    () => products?.pages.flatMap((page) => page.data),
    [products],
  );

  const { ref, inView } = useInView();
  const router = useRouter();

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
    <Card className="gap-2 py-2">
      <CardHeader className="px-2">
        <ProductsFilter />
      </CardHeader>

      <CardContent className="px-2">
        <div className="bg-background overflow-hidden rounded-md border">
          <Table containerClassName="h-fit max-h-[75svh] overflow-y-auto">
            <ProductsTableHeader />

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() =>
                      router.push(`/admin/products/${row.original.id}`)
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
                    colSpan={productColumns.length}
                    className="text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-32">
                      <PackageOpenIcon size={64} />
                      <p className="text-lg font-medium">No Products Found.</p>
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
