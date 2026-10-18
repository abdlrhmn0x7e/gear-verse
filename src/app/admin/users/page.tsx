import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";

import { requireAdmin } from "~/server/auth";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { PageLayout } from "../_components/page-layout";
import { UserOrdersDrawer } from "../_components/drawers/user-orders-drawer";
import { UsersFilters } from "../_components/tables/users/filters";
import { UsersTableSkeleton } from "../_components/tables/users/skeleton";
import { UsersTable } from "../_components/tables/users/table";
import { loadUserSearchParams } from "../_hooks/use-user-search-params";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await loadUserSearchParams(searchParams);
  void prefetch(
    trpc.admin.users.queries.getManagePage.infiniteQueryOptions(
      {
        pageSize: 15,
        filters: {
          search: params.search ?? undefined,
          role: params.role ?? undefined,
          status: params.status ?? undefined,
        },
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <PageLayout
      title="Users"
      description="Everyone with an account. Guest checkouts aren't listed."
      contentWidth="full"
      toolbar={<UsersFilters />}
    >
      <HydrateClient>
        <Suspense fallback={<UsersTableSkeleton />}>
          <UsersTable />
        </Suspense>
      </HydrateClient>

      <UserOrdersDrawer />
    </PageLayout>
  );
}
