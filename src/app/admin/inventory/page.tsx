import { EditInventory } from "./_components/edit-inventory";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { Suspense } from "react";
import type { SearchParams } from "nuqs";
import { loadInventorySearchParams } from "../_hooks/use-inventory-search-params";
import { InventoryItemFilter } from "../_components/tables/inventory/filters";
import { InventoryTableSkeleton } from "../_components/tables/inventory/skeleton";
import { requireAdmin } from "~/server/auth";
import { PageLayout } from "../_components/page-layout";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const filters = await loadInventorySearchParams(searchParams);
  void prefetch(
    trpc.admin.inventoryItems.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 15,
        filters: {
          inventorySearch: filters.inventorySearch ?? undefined,
        },
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <PageLayout
      title="Inventory"
      description="Easily view, update, and organize your product inventory"
      contentWidth="full"
    >
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
    </PageLayout>
  );
}
