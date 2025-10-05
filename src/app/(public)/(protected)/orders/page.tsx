import { PackageOpenIcon } from "lucide-react";
import Header from "~/components/header";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { OrdersTable } from "./_components/orders/table";
import { api } from "~/trpc/server";
import { OrdersDrawer } from "./_components/orders-drawer";
import type { SearchParams } from "nuqs/server";
import { loadOrderSearchParams } from "./_hooks/use-orders-search-params";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  void loadOrderSearchParams(searchParams);
  const orders = await api.public.orders.queries.findAll();

  return (
    <section className="min-h-screen py-32">
      <MaxWidthWrapper className="space-y-6">
        <Header
          title="Orders"
          description="View your orders, review the details, and track the status."
          headingLevel={3}
          Icon={PackageOpenIcon}
        />

        <OrdersTable orders={orders} />

        <OrdersDrawer />
      </MaxWidthWrapper>
    </section>
  );
}
