import { headers } from "next/headers";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { auth, requireAdmin } from "~/server/auth";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { PageLayout } from "../_components/page-layout";
import { DashboardActions, DashboardPanels } from "./_components/dashboard";
import { firstName, greetingFor } from "./_components/format";
import { loadDashboardSearchParams } from "./_components/use-dashboard-range";
import {
  WaitingSummary,
  WaitingSummarySkeleton,
} from "./_components/waiting-summary";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const [session, { range }] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    loadDashboardSearchParams(searchParams),
  ]);

  // started together and not awaited: each panel streams in when its query lands
  void prefetch(trpc.admin.dashboard.queries.revenue.queryOptions({ range }));
  void prefetch(trpc.admin.dashboard.queries.orders.queryOptions({ range }));
  void prefetch(trpc.admin.dashboard.queries.pending.queryOptions());
  void prefetch(trpc.admin.dashboard.queries.lowStock.queryOptions());
  void prefetch(
    trpc.admin.dashboard.queries.topProducts.queryOptions({ range }),
  );
  void prefetch(trpc.admin.dashboard.queries.reviews.queryOptions({ range }));

  const name = session?.user.name ? `, ${firstName(session.user.name)}` : "";

  return (
    <HydrateClient>
      <PageLayout
        title="Dashboard"
        description={
          <>
            {greetingFor(new Date())}
            {name}.{" "}
            <Suspense fallback={<WaitingSummarySkeleton />}>
              <WaitingSummary />
            </Suspense>
          </>
        }
        actions={<DashboardActions />}
        contentWidth="full"
      >
        <DashboardPanels />
      </PageLayout>
    </HydrateClient>
  );
}
