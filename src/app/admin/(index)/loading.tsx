import { HomeIcon } from "lucide-react";
import { HeaderSkeleton } from "../../../components/header";
import { Skeleton } from "~/components/ui/skeleton";
import { Heading } from "~/components/heading";
import { Card, CardContent } from "~/components/ui/card";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "~/components/ui/frame";
import { ShoppingCartIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from "~/components/ui/table";

export default function Loading() {
  return (
    <section className="space-y-6">
      <HeaderSkeleton Icon={HomeIcon} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>

      <div className="space-y-3">
        <Heading level={3}>Quick Actions</Heading>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
        </div>
      </div>

      <Frame>
        <FrameHeader>
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="size-6" />
            <FrameTitle className="text-lg font-semibold">
              Last Orders
            </FrameTitle>
          </div>
          <FrameDescription>
            View the last 5 orders placed in your store.
          </FrameDescription>
        </FrameHeader>
        <FramePanel>
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 pb-1">
                <TableHead className="w-[200px]">Order No.</TableHead>
                <TableHead>Shipping Address</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Ordered At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </FramePanel>
      </Frame>
    </section>
  );
}

function SummaryCardSkeleton() {
  return (
    <Card className="from-card to-background bg-gradient-to-b">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="mb-2 h-5 w-32" />
          <Skeleton className="mb-2 h-8 w-16" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="from-card to-accent rounded-lg bg-gradient-to-b p-px">
          <div className="to-card from-accent rounded-lg bg-radial p-2">
            <Skeleton className="size-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionSkeleton() {
  return (
    <div className="ring-primary overflow-hidden rounded-lg border">
      <div className="from-card to-background flex items-center justify-center gap-3 overflow-hidden rounded-[calc(var(--radius)+1px)] bg-gradient-to-t">
        <div className="bg-background flex size-24 items-center justify-center overflow-hidden border-r">
          <div className="from-card to-primary/20 relative flex size-18 items-center justify-center overflow-hidden rounded-full border bg-gradient-to-t">
            <Skeleton className="size-12 rounded-full" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
