import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { OrdersHeading } from "./_components/orders-heading";
import { getStoreSettings } from "~/lib/store-settings";
import { getSession } from "~/server/auth";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { OrderCards, OrderCardsSkeleton } from "./_components/order-cards";
import { OrdersDrawer } from "./_components/orders-drawer";

export default async function OrdersPage() {
  const { whatsappNumber } = await getStoreSettings();

  return (
    <section className="min-h-dvh pt-28 pb-24 md:pt-36">
      <MaxWidthWrapper className="max-w-3xl space-y-8">
        <OrdersHeading whatsappNumber={whatsappNumber} />

        <Suspense fallback={<OrderCardsSkeleton />}>
          <Orders whatsappNumber={whatsappNumber} />
        </Suspense>
      </MaxWidthWrapper>
    </section>
  );
}

/** The session decides whose orders these are, so this part waits for the request. */
async function Orders({ whatsappNumber }: { whatsappNumber: string | null }) {
  const session = await getSession();
  if (!session) notFound();

  void prefetch(
    trpc.public.orders.queries.getPage.infiniteQueryOptions(
      { pageSize: 10 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <Suspense fallback={<OrderCardsSkeleton />}>
        <OrderCards isGuest={session.user.isAnonymous === true} />
      </Suspense>
      <OrdersDrawer whatsappNumber={whatsappNumber} />
    </HydrateClient>
  );
}
