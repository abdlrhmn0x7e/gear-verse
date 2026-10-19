"use client";

import { type RowSelectionState } from "@tanstack/react-table";

// React & Next
import { useEffect, useMemo, useState } from "react";

// Third-party hooks & utilities
import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { useInView } from "react-intersection-observer";

// UI & Icons
import { Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";

// Custom hooks
import { useDebounce } from "~/hooks/use-debounce";
import { useProductSearchParams } from "../../../_hooks/use-product-search-params";

// Table logic & components
import { productColumns } from "./columns";
import { ProductsTableSkeleton } from "./skeleton";
import { useProductPins } from "./pin";
import { ListGrid, useListTable } from "../list-grid";
import { useTRPC } from "~/trpc/client";
import { BulkDeleteProductsDialog } from "../../dialogs/bulk-delete-products";

export function ProductsTable() {
  const [params, setParams] = useProductSearchParams();
  const debouncedFilters = useDebounce(params);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const trpc = useTRPC();
  const filters = {
    title: debouncedFilters.title ?? undefined,
    brands: params.brands ?? undefined,
    categories: params.categories ?? undefined,
  };
  const { data: pinned, isFetching: isFetchingPinned } = useSuspenseQuery(
    trpc.admin.products.queries.getPinned.queryOptions(
      { filters },
      { placeholderData: keepPreviousData },
    ),
  );
  const {
    data: products,
    isPending,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.admin.products.queries.getPage.infiniteQueryOptions(
      { pageSize: 15, filters },
      {
        placeholderData: keepPreviousData,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
  // the pinned products lead the list, in the order the home page shows them
  const productsData = useMemo(
    () => [...pinned, ...(products?.pages.flatMap((page) => page.data) ?? [])],
    [pinned, products],
  );
  const pins = useProductPins();

  const table = useListTable({
    data: productsData,
    columns: productColumns,
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    state: {
      rowSelection,
      columnVisibility: { reorder: pinned.length > 0 },
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

  const filtered = [
    params.title,
    params.brands?.length,
    params.categories?.length,
  ].some(Boolean);

  const pinnedIds = pinned.map((product) => product.id);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = pinnedIds.indexOf(Number(active.id));
    const to = pinnedIds.indexOf(Number(over.id));
    if (from === -1 || to === -1) return;
    pins.reorder(arrayMove(pinnedIds, from, to));
  }

  return (
    <div className="space-y-4">
      {selectedProductIds.length > 0 && (
        <div className="flex justify-end">
          <BulkDeleteProductsDialog
            ids={selectedProductIds}
            onDeleteSuccess={handleBulkDeleteSuccess}
            Trigger={
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2Icon data-icon="inline-start" />
                Delete selected ({selectedProductIds.length})
              </Button>
            }
          />
        </div>
      )}

      <ListGrid
        table={table}
        isFetching={isFetching || isFetchingPinned}
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
        // a filtered list shows only some pinned products, so there's no whole order to drag
        sortable={
          filtered
            ? undefined
            : { ids: pinnedIds.map(String), onDragEnd: handleDragEnd }
        }
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
