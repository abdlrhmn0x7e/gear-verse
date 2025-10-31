import { PackageOpenIcon } from "lucide-react";
import Header from "~/components/header";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { OrdersDrawer } from "./_components/orders-drawer";
import type { SearchParams } from "nuqs/server";
import { loadOrderSearchParams } from "./_hooks/use-orders-search-params";
import { OrderCards, OrderCardsSkeleton } from "./_components/order-cards";
import { Suspense } from "react";
import { requireAuth } from "~/server/auth";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth();
  void loadOrderSearchParams(searchParams);
  void prefetch(
    trpc.public.orders.queries.getPage.queryOptions({ pageSize: 10 }),
  );

  return (
    <section className="min-h-screen py-24">
      <MaxWidthWrapper className="max-w-7xl space-y-6">
        <Header
          title="Orders"
          description="View your orders, review the details, and track the status."
          headingLevel={3}
          Icon={PackageOpenIcon}
        />

        <HydrateClient>
          <Suspense fallback={<OrderCardsSkeleton />}>
            <OrderCards />
          </Suspense>
        </HydrateClient>

        <OrdersDrawer />
      </MaxWidthWrapper>
    </section>
  );
}
