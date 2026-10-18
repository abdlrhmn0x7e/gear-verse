import { requireAdmin } from "~/server/auth";
import { AttributesView } from "./_components/attributes-view";
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
      {/* The canvas sits on the page so its nodes can take the card surface. */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border p-2">
        <ReactFlowProvider>
          <HydrateClient>
            <Suspense fallback={<AttributeViewSkeleton />}>
              <AttributesView />
            </Suspense>
          </HydrateClient>
        </ReactFlowProvider>
      </div>
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
