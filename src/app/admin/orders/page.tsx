import { BadgeDollarSignIcon } from "lucide-react";
import Header from "~/components/header";
import { api, HydrateClient, prefetch, trpc } from "~/trpc/server";
import { OrdersTable } from "../_components/tables/orders/table";
import { OrderDrawer } from "../_components/drawers/order-drawer";
import { AddOrderDialog } from "../_components/dialogs/add-order";
import { requireAdmin } from "~/server/auth";
import { Suspense } from "react";
import { OrdersTableSkeleton } from "../_components/tables/orders/skeleton";

export default async function AdminOrdersPage() {
  await requireAdmin();
  void prefetch(
    trpc.admin.orders.queries.getPage.infiniteQueryOptions({
      pageSize: 10,
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

        {/* <AddOrderDialog /> */}
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
