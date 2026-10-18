import { requireAdmin } from "~/server/auth";
import { AttributesView } from "./_components/attributes-view";
import { Card, CardContent } from "~/components/ui/card";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ReactFlowProvider } from "@xyflow/react";
import { Suspense } from "react";
import { Spinner } from "~/components/spinner";
import { PageLayout } from "../_components/page-layout";

export default async function AdminAttributesPage() {
  await requireAdmin();
  void Promise.all([
    prefetch(trpc.admin.categories.queries.findRoots.queryOptions()),
    prefetch(trpc.admin.attributes.queries.getAll.queryOptions()),
    prefetch(trpc.admin.attributes.queries.getAllConnections.queryOptions()),
  ]);

  // The graph is a canvas, so the page is pinned to the viewport and the card takes what the title leaves.
  return (
    <PageLayout
      title="Attributes"
      description="Manage, add, and edit your attributes"
      contentWidth="fill"
      contentClassName="md:px-9 md:pt-8 md:pb-6"
    >
      <Card className="min-h-0 flex-1 p-2">
        <CardContent className="relative h-full p-0">
          <ReactFlowProvider>
            <HydrateClient>
              <Suspense fallback={<AttributeViewSkeleton />}>
                <AttributesView />
              </Suspense>
            </HydrateClient>
          </ReactFlowProvider>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

function AttributeViewSkeleton() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-1 p-0">
      <Spinner />
      <p className="font-medium">Loading Editor</p>
    </div>
  );
}
