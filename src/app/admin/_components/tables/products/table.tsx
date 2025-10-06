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
import { useProductSearchParams } from "../../../_hooks/use-product-search-params";

// Table logic & components
import { api } from "~/trpc/react";
import { productColumns } from "./columns";
import { ProductsFilter } from "./filters";
import { ProductsTableHeader } from "./header";
import { ProductsTableSkeleton } from "./skeleton";
import { cn } from "~/lib/utils";

export function ProductsTable() {
  const [params, setParams] = useProductSearchParams();
  const debouncedFilters = useDebounce(params);
  const utils = api.useUtils();
  const {
    data: products,
    isPending,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    utils.admin.products.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
        filters: {
          title: debouncedFilters.title ?? undefined,
          brands: params.brands ?? undefined,
          categories: params.categories ?? undefined,
        },
      },
      {
        placeholderData: keepPreviousData,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
  const productsData = useMemo(
    () => products?.pages.flatMap((page) => page.data) ?? [],
    [products],
  );

  const { ref, inView } = useInView();

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

  if (isPending) {
    return <ProductsTableSkeleton />;
  }

  return (
    <Card className="gap-2 py-2">
      <CardHeader className="px-2">
        <ProductsFilter />
      </CardHeader>

      <CardContent className="px-2">
        <div
          className={cn(
            "bg-background overflow-hidden rounded-lg border transition-opacity",
            isFetching && "opacity-75",
          )}
        >
          <Table containerClassName="h-fit max-h-[75svh] overflow-y-auto">
            <ProductsTableHeader />

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                    onClick={() =>
                      setParams((prev) => ({
                        ...prev,
                        slug: row.original.slug,
                      }))
                    }
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
