import { PackageIcon } from "lucide-react";
import { EditInventory } from "./_components/edit-inventory";
import Header from "~/components/header";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { api, HydrateClient } from "~/trpc/server";
import { Suspense } from "react";
import type { SearchParams } from "nuqs";
import { loadInventorySearchParams } from "../_hooks/use-inventory-search-params";
import { InventoryItemFilter } from "../_components/tables/inventory/filters";
import { InventoryTableSkeleton } from "../_components/tables/inventory/skeleton";
import { requireAdmin } from "~/server/auth";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const filters = await loadInventorySearchParams(searchParams);
  void api.admin.inventoryItems.queries.getPage.prefetchInfinite({
    pageSize: 10,
    filters: {
      inventorySearch: filters.inventorySearch ?? undefined,
    },
  });

  return (
    <section className="space-y-6">
      <Header
        title="Inventory"
        description="Easily view, update, and organize your product inventory"
        Icon={PackageIcon}
      />

      <Card className="gap-1 p-2">
        <CardHeader className="p-0">
          <InventoryItemFilter className="max-w-sm" />
        </CardHeader>
        <CardContent className="p-0">
          <HydrateClient>
            <Suspense fallback={<InventoryTableSkeleton />}>
              <EditInventory />
            </Suspense>
          </HydrateClient>
        </CardContent>
      </Card>
    </section>
  );
}
