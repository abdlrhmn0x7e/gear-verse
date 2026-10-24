import { Suspense } from "react";

import { requireAdmin } from "~/server/auth";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { AddBrandDrawer } from "../_components/drawers/add-brand";
import { PageLayout } from "../_components/page-layout";
import { BrandsTableSkeleton } from "../_components/tables/brands/skeleton";
import { BrandsTable } from "../_components/tables/brands/table";

export default async function AdminBrandsPage() {
  await requireAdmin();
  void prefetch(
    trpc.admin.brands.queries.getPage.infiniteQueryOptions(
      { pageSize: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <PageLayout
      title="Brands"
      description="Manage brand names, logos and the products that use them."
      contentWidth="full"
      actions={<AddBrandDrawer variant="default" />}
    >
      <HydrateClient>
        <Suspense fallback={<BrandsTableSkeleton />}>
          <BrandsTable />
        </Suspense>
      </HydrateClient>
    </PageLayout>
  );
}
