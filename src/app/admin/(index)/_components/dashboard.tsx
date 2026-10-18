import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import {
  ConfirmationQueue,
  ConfirmationQueueSkeleton,
} from "./confirmation-queue";
import {
  AwaitingConfirmationCard,
  KpiCardSkeleton,
  LowStockCard,
  OrdersCard,
  RevenueCard,
} from "./kpi-cards";
import { LowStockList, LowStockListSkeleton } from "./low-stock-list";
import { NewReviews, NewReviewsSkeleton } from "./new-reviews";
import { RangeSwitch } from "./range-switch";
import { RevenueChart, RevenueChartSkeleton } from "./revenue-chart";
import { TopProducts, TopProductsSkeleton } from "./top-products";

/**
 * The range switch and the two things an admin starts most often. The page's
 * action row doesn't wrap, so on a phone the buttons keep their icons and
 * hand their labels to screen readers to fit beside the switch.
 */
export function DashboardActions() {
  return (
    <>
      <RangeSwitch />
      <Button variant="outline" className="max-sm:size-9 max-sm:p-0" asChild>
        {/* the orders page opens its create-order drawer for ?create=true */}
        <Link href="/admin/orders?create=true">
          <PlusIcon data-icon="inline-start" />
          <span className="max-sm:sr-only">Create order</span>
        </Link>
      </Button>
      <Button className="max-sm:size-9 max-sm:p-0" asChild>
        <Link href="/admin/products/new">
          <PlusIcon data-icon="inline-start" />
          <span className="max-sm:sr-only">Add product</span>
        </Link>
      </Button>
    </>
  );
}

const kpiGrid = "grid grid-cols-1 gap-3 @xl:grid-cols-2 @5xl:grid-cols-4";
const middleRow = "grid grid-cols-1 items-start gap-3 @4xl:grid-cols-3";
const queueSpan = "@4xl:col-span-2";
const bottomRow = "grid grid-cols-1 items-start gap-3 @3xl:grid-cols-2";

/**
 * The dashboard's panels: four headline numbers, the confirmation queue with
 * stock and reviews beside it, then revenue by day and the best sellers. Each
 * panel streams in on its own behind its own skeleton.
 */
export function DashboardPanels() {
  return (
    <div className="@container flex flex-col gap-3">
      <div className={kpiGrid}>
        <Suspense fallback={<KpiCardSkeleton label="Revenue" />}>
          <RevenueCard />
        </Suspense>
        <Suspense fallback={<KpiCardSkeleton label="Orders" />}>
          <OrdersCard />
        </Suspense>
        <Suspense fallback={<KpiCardSkeleton label="Awaiting confirmation" />}>
          <AwaitingConfirmationCard />
        </Suspense>
        <Suspense fallback={<KpiCardSkeleton label="Low stock" />}>
          <LowStockCard />
        </Suspense>
      </div>

      <div className={middleRow}>
        <Suspense
          fallback={<ConfirmationQueueSkeleton className={queueSpan} />}
        >
          <ConfirmationQueue className={queueSpan} />
        </Suspense>
        <div className="flex flex-col gap-3">
          <Suspense fallback={<LowStockListSkeleton />}>
            <LowStockList />
          </Suspense>
          <Suspense fallback={<NewReviewsSkeleton />}>
            <NewReviews />
          </Suspense>
        </div>
      </div>

      <div className={bottomRow}>
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<TopProductsSkeleton />}>
          <TopProducts />
        </Suspense>
      </div>
    </div>
  );
}

/** Every panel at once in its loading state, for the route's loading.tsx. */
export function DashboardPanelsSkeleton() {
  return (
    <div className="@container flex flex-col gap-3">
      <div className={kpiGrid}>
        <KpiCardSkeleton label="Revenue" />
        <KpiCardSkeleton label="Orders" />
        <KpiCardSkeleton label="Awaiting confirmation" />
        <KpiCardSkeleton label="Low stock" />
      </div>
      <div className={middleRow}>
        <ConfirmationQueueSkeleton className={queueSpan} />
        <div className="flex flex-col gap-3">
          <LowStockListSkeleton />
          <NewReviewsSkeleton />
        </div>
      </div>
      <div className={bottomRow}>
        <RevenueChartSkeleton />
        <TopProductsSkeleton />
      </div>
    </div>
  );
}
