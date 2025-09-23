import { BadgeDollarSignIcon } from "lucide-react";
import Header from "~/components/header";
import { api, HydrateClient } from "~/trpc/server";
import { OrdersTable } from "../_components/tables/orders/table";

export default function AdminOrdersPage() {
  void api.admin.orders.getPage.prefetchInfinite({
    pageSize: 10,
  });

  return (
    <section className="space-y-6">
      <Header
        title="Orders"
        description="View all orders placed in your store."
        Icon={BadgeDollarSignIcon}
      />

      <HydrateClient>
        <OrdersTable />
      </HydrateClient>
    </section>
  );
}
