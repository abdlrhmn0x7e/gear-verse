import { PlusIcon } from "lucide-react";
import { PageLayout } from "../_components/page-layout";
import { OrdersTableSkeleton } from "../_components/tables/orders/skeleton";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { orderPresets } from "~/lib/orders/presets";

// Opening an order only changes the URL on the client, so this shows on
// arriving here and never over a row click.
export default function AdminOrdersLoading() {
  return (
    <PageLayout
      title="Orders"
      description="View all orders placed in your store."
      contentWidth="table"
      actions={
        <Button disabled>
          <PlusIcon data-icon="inline-start" />
          Create Order
        </Button>
      }
      toolbar={<Skeleton className="h-9 w-full rounded-full sm:w-72" />}
    >
      {/* the preset tabs' row: one bar per tab */}
      <div className="flex h-10 shrink-0 items-center gap-5 overflow-hidden px-3">
        {orderPresets.map((preset) => (
          <Skeleton key={preset.id} className="h-4 w-20 shrink-0" />
        ))}
      </div>
      <OrdersTableSkeleton />
    </PageLayout>
  );
}
