import { PlusIcon } from "lucide-react";
import { PageLayout } from "../_components/page-layout";
import { OrdersTableSkeleton } from "../_components/tables/orders/skeleton";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

// Opening an order only changes the URL on the client, so this shows on
// arriving here and never over a row click.
export default function AdminOrdersLoading() {
  return (
    <PageLayout
      title="Orders"
      description="View all orders placed in your store."
      contentWidth="full"
      actions={
        <Button disabled>
          <PlusIcon data-icon="inline-start" />
          Create Order
        </Button>
      }
      toolbar={
        <>
          <Skeleton className="h-9 w-full rounded-full sm:w-72" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </>
      }
    >
      <OrdersTableSkeleton />
    </PageLayout>
  );
}
