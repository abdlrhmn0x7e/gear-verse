import { Skeleton } from "~/components/ui/skeleton";
import { PageLayout } from "../_components/page-layout";
import { DashboardPanelsSkeleton } from "./_components/dashboard";
import { WaitingSummarySkeleton } from "./_components/waiting-summary";

export default function Loading() {
  return (
    <PageLayout
      title="Dashboard"
      description={<WaitingSummarySkeleton />}
      actions={
        <>
          <Skeleton className="h-9 w-56 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </>
      }
      contentWidth="full"
    >
      <DashboardPanelsSkeleton />
    </PageLayout>
  );
}
