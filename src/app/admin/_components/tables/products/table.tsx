"use client";

import { type RowSelectionState } from "@tanstack/react-table";

// React & Next
import { useEffect, useMemo, useState } from "react";

// Third-party hooks & utilities
import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

// UI & Icons
import { TrashIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

// Custom hooks
import { useDebounce } from "~/hooks/use-debounce";
import { useProductSearchParams } from "../../../_hooks/use-product-search-params";

// Table logic & components
import { productColumns } from "./columns";
import { ProductsFilters } from "./filters";
import { ProductsTableSkeleton } from "./skeleton";
import { ListGrid, useListTable } from "../list-grid";
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

  const table = useListTable({
    data: productsData,
    columns: productColumns,
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

  const filtered = Boolean(
    params.title || params.brands?.length || params.categories?.length,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <ProductsFilters className="flex-1" />

        {selectedProductIds.length > 0 && (
          <BulkDeleteProductsDialog
            ids={selectedProductIds}
            onDeleteSuccess={handleBulkDeleteSuccess}
            Trigger={
              <Button variant="destructive" className="w-full gap-2 lg:w-auto">
                <TrashIcon className="size-4" />
                Delete selected ({selectedProductIds.length})
              </Button>
            }
          />
        )}
      </div>

      <ListGrid
        table={table}
        isFetching={isFetching}
        onRowClick={(product) =>
          setParams(
            () => ({
              id: product.id,
              slug: product.slug,
            }),
            { shallow: false },
          )
        }
        hasNextPage={hasNextPage}
        loadMoreRef={ref}
        empty={
          filtered
            ? {
                title: "No products match these filters",
                description: "Try a different title, brand or category.",
              }
            : {
                title: "No Products Found.",
                description:
                  "What a shame get your ass to work and create some",
              }
        }
      />
    </div>
  );
}
