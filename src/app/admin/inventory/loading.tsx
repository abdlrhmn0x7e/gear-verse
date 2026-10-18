import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { InventoryItemFilter } from "../_components/tables/inventory/filters";
import { InventoryTableSkeleton } from "../_components/tables/inventory/skeleton";
import { PageLayout } from "../_components/page-layout";

export default async function AdminInventoryPage() {
  return (
    <PageLayout
      title="Inventory"
      description="Easily view, update, and organize your product inventory"
      contentWidth="full"
    >
      <Card className="gap-1 p-2">
        <CardHeader className="p-0">
          <InventoryItemFilter className="pointer-events-none max-w-sm opacity-50" />
        </CardHeader>
        <CardContent className="p-0">
          <InventoryTableSkeleton />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
