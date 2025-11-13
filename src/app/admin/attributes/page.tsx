import { IconKeyframes } from "@tabler/icons-react";
import Header from "~/components/header";
import { requireAdmin } from "~/server/auth";
import { AttributesView } from "./_components/attributes-view";
import { Card, CardContent } from "~/components/ui/card";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ReactFlowProvider } from "@xyflow/react";
import { Suspense } from "react";
import { Spinner } from "~/components/spinner";

export default async function AdminAttributesPage() {
  await requireAdmin();
  void prefetch(trpc.admin.attributes.queries.getAll.queryOptions());
  void prefetch(
    trpc.admin.categories.queries.findAll.queryOptions({
      filters: { root: true },
    }),
  );

  return (
    <section className="flex h-full flex-col gap-6">
      <Header
        title="Attributes"
        description="Manage, add, and edit your attributes"
        Icon={IconKeyframes}
      />

      <Card className="h-full p-2">
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
    </section>
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
