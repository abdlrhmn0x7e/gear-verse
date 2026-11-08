import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { OrdersTable } from "../_components/tables/orders/table";
import { OrderDrawer } from "../_components/drawers/order-drawer";
import { Suspense } from "react";
import { OrdersTableSkeleton } from "../_components/tables/orders/skeleton";
import {
  OrderPresetTabs,
  OrdersFilters,
} from "../_components/tables/orders/filters";
import {
  loadOrderSearchParams,
  toOrdersFilter,
} from "../_hooks/use-order-search-params";
import { CreateOrderDrawer } from "./_components/create-order-drawer";
import { requireAdmin } from "~/server/auth";
import type { SearchParams } from "nuqs/server";
import { PageLayout } from "../_components/page-layout";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await loadOrderSearchParams(searchParams);
  void prefetch(
    trpc.admin.orders.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 15,
        filters: toOrdersFilter(params),
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  // awaited so the tabs render with their counts on the server; the list still streams
  await prefetch(trpc.admin.orders.queries.getPresetCounts.queryOptions());

  // the preset tabs read their counts from the cache, so they sit inside the boundary
  return (
    <HydrateClient>
      <PageLayout
        title="Orders"
        description="View all orders placed in your store."
        contentWidth="table"
        actions={<CreateOrderDrawer />}
        toolbar={<OrdersFilters />}
      >
        <OrderPresetTabs />
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersTable />
        </Suspense>

        <OrderDrawer />
      </PageLayout>
    </HydrateClient>
  );
}
