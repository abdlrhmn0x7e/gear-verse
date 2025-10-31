import { PackageOpenIcon } from "lucide-react";
import Header from "~/components/header";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { OrdersTableSkeleton } from "./_components/orders/skeleton";
import { OrderCardsSkeleton } from "./_components/order-cards";

export default function OrdersLoading() {
  return (
    <section className="min-h-screen py-32">
      <MaxWidthWrapper className="space-y-6">
        <Header
          title="Orders"
          description="View your orders, review the details, and track the status."
          headingLevel={3}
          Icon={PackageOpenIcon}
        />

        <OrderCardsSkeleton />
      </MaxWidthWrapper>
    </section>
  );
}
