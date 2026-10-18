"use client";

// React & Next
import { useEffect, useMemo } from "react";

// Third-party hooks & utilities
import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

// Custom hooks
import { useDebounce } from "~/hooks/use-debounce";
import { useOrderSearchParams } from "../../../_hooks/use-order-search-params";

// Table logic & components
import { useTRPC } from "~/trpc/client";
import { ordersColumns } from "./columns";
import { OrdersFilters } from "./filters";
import { ListGrid, useListTable } from "../list-grid";

export function OrdersTable() {
  const trpc = useTRPC();
  const [params, setParams] = useOrderSearchParams();
  const debouncedFilters = useDebounce(params);
  const {
    data: orders,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.admin.orders.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 15,
        filters: {
          phoneNumber: debouncedFilters.search ?? undefined,
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

  const table = useListTable({
    data: ordersData,
    columns: ordersColumns,
    getRowId: (row) => row.id.toString(),
  });

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const filtered = [params.search, params.status, params.paymentMethod].some(
    Boolean,
  );

  return (
    <div className="space-y-4">
      <OrdersFilters />

      <ListGrid
        table={table}
        isFetching={isFetching}
        onRowClick={(order) => setParams({ ...params, orderId: order.id })}
        hasNextPage={hasNextPage}
        loadMoreRef={ref}
        empty={
          filtered
            ? {
                title: "No orders match these filters",
                description:
                  "Try a different phone number, status or payment method.",
              }
            : {
                title: "No Orders Found.",
                description:
                  "What a shame get your ass to work and generate some orders.",
              }
        }
      />
    </div>
  );
}
