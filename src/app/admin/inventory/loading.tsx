import { InventoryFilters } from "../_components/tables/inventory/filters";
import { InventoryTableSkeleton } from "../_components/tables/inventory/skeleton";
import { PageLayout } from "../_components/page-layout";

export default async function AdminInventoryPage() {
  return (
    <PageLayout
      title="Inventory"
      description="Easily view, update, and organize your product inventory"
      contentWidth="full"
      toolbar={<InventoryFilters className="pointer-events-none opacity-50" />}
    >
      <InventoryTableSkeleton />
    </PageLayout>
  );
}
