import { BadgeDollarSignIcon } from "lucide-react";
import Header from "~/components/header";
import { api, HydrateClient } from "~/trpc/server";
import { OrdersTable } from "../_components/tables/orders/table";
import { OrderDrawer } from "../_components/drawers/order-drawer";
import { AddOrderDialog } from "../_components/dialogs/add-order";

export default function AdminOrdersPage() {
  void api.admin.orders.getPage.prefetchInfinite({
    pageSize: 10,
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Header
          title="Orders"
          description="View all orders placed in your store."
          Icon={BadgeDollarSignIcon}
        />

        <AddOrderDialog />
      </div>

      <HydrateClient>
        <OrdersTable />
        <OrderDrawer />
      </HydrateClient>
    </section>
  );
}
