import { PackageOpenIcon } from "lucide-react";
import Header from "~/components/header";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { OrdersDrawer } from "./_components/orders-drawer";
import type { SearchParams } from "nuqs/server";
import { loadOrderSearchParams } from "./_hooks/use-orders-search-params";
import { OrderCards, OrderCardsSkeleton } from "./_components/order-cards";
import { Suspense } from "react";
import { getStoreSettings } from "~/lib/store-settings";
import { requireAuth } from "~/server/auth";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth();
  const { whatsappNumber } = await getStoreSettings();
  void loadOrderSearchParams(searchParams);
  void prefetch(
    trpc.public.orders.queries.getPage.infiniteQueryOptions(
      { pageSize: 10 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <section className="min-h-screen pt-28 pb-24 md:pt-36">
      <MaxWidthWrapper className="max-w-7xl space-y-6">
        <Header
          title="Orders"
          description="View your orders, review the details, and track the status."
          headingLevel={3}
          headingAs={1}
          Icon={PackageOpenIcon}
        />

        {whatsappNumber && (
          <p className="text-muted-foreground text-sm text-pretty">
            Questions about an order? WhatsApp us at{" "}
            <WhatsAppNumberLink
              number={whatsappNumber}
              message="Hi Gear Verse, I have a question about my order."
              className="text-foreground font-medium tabular-nums underline decoration-from-font underline-offset-4"
            />
            .
          </p>
        )}

        <HydrateClient>
          <Suspense fallback={<OrderCardsSkeleton />}>
            <OrderCards />
          </Suspense>
        </HydrateClient>

        <OrdersDrawer whatsappNumber={whatsappNumber} />
      </MaxWidthWrapper>
    </section>
  );
}
