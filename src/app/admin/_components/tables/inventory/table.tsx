"use client";

import { useInventoryTableColumns } from "./columns";
import { ListGrid, useListTable } from "../list-grid";

import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { useTRPC } from "~/trpc/client";
import { useDebounce } from "~/hooks/use-debounce";

export function InventoryTable() {
  const [params] = useInventorySearchParams();
  const trpc = useTRPC();
  const debouncedFilters = useDebounce(params);
  const {
    data: items,
    isFetching,
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

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const columns = useInventoryTableColumns();
  const table = useListTable({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <ListGrid
      table={table}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      loadMoreRef={ref}
      // Room under the last row for the floating unsaved-changes bar.
      className="pb-24"
      empty={
        params.inventorySearch
          ? {
              title: "No items match this search",
              description: "Try a different product name.",
            }
          : {
              title: "No Items Found.",
              description: "What a shame get your ass to work and create some",
            }
      }
    />
  );
}
