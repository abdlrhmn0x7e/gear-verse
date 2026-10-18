import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { OrdersTable } from "../_components/tables/orders/table";
import { OrderDrawer } from "../_components/drawers/order-drawer";
import { Suspense } from "react";
import { OrdersTableSkeleton } from "../_components/tables/orders/skeleton";
import { OrdersFilters } from "../_components/tables/orders/filters";
import { loadOrderSearchParams } from "../_hooks/use-order-search-params";
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
        filters: params
          ? {
              phoneNumber: params.search ?? undefined,
              status: params.status ?? undefined,
              paymentMethod: params.paymentMethod ?? undefined,
            }
          : undefined,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <PageLayout
      title="Orders"
      description="View all orders placed in your store."
      contentWidth="full"
      actions={<CreateOrderDrawer />}
      toolbar={<OrdersFilters />}
    >
      <HydrateClient>
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersTable />
        </Suspense>
      </HydrateClient>

      <OrderDrawer />
    </PageLayout>
  );
}
