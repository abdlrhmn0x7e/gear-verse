import { Suspense } from "react";
import { Card, CardContent } from "~/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { AttributeValuesView } from "./attribute-values-view";
import {
  AttributesExplorer,
  AttributesExplorerSkeleton,
} from "./attributes-explorer";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export function AttributesViewer() {
  void prefetch(trpc.admin.attributes.queries.getAll.queryOptions());

  return (
    <Card className="h-full p-2">
      <CardContent className="h-full p-0">
        <ResizablePanelGroup className="h-full" direction="horizontal">
          <ResizablePanel
            className="relative flex h-full flex-col gap-2 py-1 pr-2 pl-1"
            defaultSize={25}
            minSize={15}
          >
            <HydrateClient>
              <Suspense fallback={<AttributesExplorerSkeleton />}>
                <AttributesExplorer />
              </Suspense>
            </HydrateClient>
          </ResizablePanel>

          <ResizableHandle className="bg-transparent" withHandle />

          <ResizablePanel defaultSize={75} minSize={60}>
            <AttributeValuesView />
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  );
}
