import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { OrderCardsSkeleton } from "./_components/order-cards";
import { OrdersHeading } from "./_components/orders-heading";

export default function OrdersLoading() {
  return (
    <section className="min-h-dvh pt-28 pb-24 md:pt-36">
      <MaxWidthWrapper className="max-w-3xl space-y-8">
        <OrdersHeading whatsappNumber={null} />
        <OrderCardsSkeleton />
      </MaxWidthWrapper>
    </section>
  );
}
