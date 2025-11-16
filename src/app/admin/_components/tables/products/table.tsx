"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";

// React & Next
import { useEffect, useMemo, useState } from "react";

// Third-party hooks & utilities
import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

// UI & Icons
import { PackageOpenIcon, TrashIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";

// Custom hooks
import { useDebounce } from "~/hooks/use-debounce";
import { useProductSearchParams } from "../../../_hooks/use-product-search-params";

// Table logic & components
import { productColumns } from "./columns";
import { ProductsFilter } from "./filters";
import { ProductsTableHeader } from "./header";
import { ProductsTableSkeleton } from "./skeleton";
import { cn } from "~/lib/utils";
import { LoadMore } from "~/components/load-more";
import { useTRPC } from "~/trpc/client";
import { BulkDeleteProductsDialog } from "../../dialogs/bulk-delete-products";

export function ProductsTable() {
  const [params, setParams] = useProductSearchParams();
  const debouncedFilters = useDebounce(params);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const trpc = useTRPC();
  const {
    data: products,
    isPending,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.admin.products.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 15,
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

  const table = useReactTable({
    data: productsData,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  });

  const selectedProductIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  function handleBulkDeleteSuccess(deletedIds: number[]) {
    table.resetRowSelection();

    if (params.id && deletedIds.includes(params.id)) {
      void setParams(
        (prev) => ({
          ...prev,
          id: null,
          slug: null,
        }),
        { shallow: true },
      );
    }
  }

  if (isPending) {
    return <ProductsTableSkeleton />;
  }

  return (
    <Card className="gap-2 py-2">
      <CardHeader className="px-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <ProductsFilter />
          </div>

          {selectedProductIds.length > 0 && (
            <div className="flex w-full justify-end lg:w-auto">
              <BulkDeleteProductsDialog
                ids={selectedProductIds}
                onDeleteSuccess={handleBulkDeleteSuccess}
                Trigger={
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full gap-2 lg:w-auto"
                  >
                    <TrashIcon className="size-4" />
                    Delete selected ({selectedProductIds.length})
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-2">
        <div
          className={cn(
            "bg-background overflow-hidden rounded-lg border transition-opacity",
            isFetching && "opacity-75",
          )}
        >
          <Table containerClassName="h-fit max-h-[75svh] overflow-y-auto">
            <ProductsTableHeader table={table} />

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                    onClick={() =>
                      setParams(
                        () => ({
                          id: row.original.id,
                          slug: row.original.slug,
                        }),
                        { shallow: false },
                      )
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
              <TableRow>
                <TableCell colSpan={productColumns.length}>
                  <div className="flex flex-col items-center justify-center">
                    <LoadMore ref={ref} hasNextPage={hasNextPage} />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
