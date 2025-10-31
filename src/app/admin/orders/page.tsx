import { BadgeDollarSignIcon } from "lucide-react";
import Header from "~/components/header";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { OrdersTable } from "../_components/tables/orders/table";
import { OrderDrawer } from "../_components/drawers/order-drawer";
import { requireAdmin } from "~/server/auth";
import { Suspense } from "react";
import { OrdersTableSkeleton } from "../_components/tables/orders/skeleton";
import { loadOrderSearchParams } from "../_hooks/use-order-search-params";
import { CreateOrderDrawer } from "./_components/crearte-order-drawer";

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  await requireAdmin();
  const params = await loadOrderSearchParams(searchParams);
  void prefetch(
    trpc.admin.orders.queries.getPage.infiniteQueryOptions({
      pageSize: 10,
      filters: params
        ? {
            orderId: params.search || undefined,
            status: params.status || undefined,
            paymentMethod: params.paymentMethod || undefined,
          }
        : undefined,
    }),
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Header
          title="Orders"
          description="View all orders placed in your store."
          Icon={BadgeDollarSignIcon}
        />

        <CreateOrderDrawer />
      </div>

      <HydrateClient>
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersTable />
        </Suspense>
      </HydrateClient>

      <OrderDrawer />
    </section>
  );
}
