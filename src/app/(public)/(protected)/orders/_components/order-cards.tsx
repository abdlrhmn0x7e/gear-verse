"use client";

import { EyeIcon } from "lucide-react";
import { PaymentMethod } from "~/components/payment-method";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardFooter,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency } from "~/lib/utils/format-currency";
import { formatDate } from "~/lib/utils/format-date";
import { type RouterOutput } from "~/trpc/client";
import { useOrdersSearchParams } from "../_hooks/use-orders-search-params";
import { LoadMore } from "~/components/load-more";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";

export function OrderCards() {
  const trpc = useTRPC();
  const {
    data: orders,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.public.orders.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="space-y-6">
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {orders.pages
          .flatMap((page) => page.data)
          .map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
      </div>

      <LoadMore ref={ref} hasNextPage={hasNextPage} />
    </div>
  );
}

export function OrderCard({
  order,
}: {
  order: RouterOutput["public"]["orders"]["queries"]["getPage"]["data"][number];
}) {
  const [, setParams] = useOrdersSearchParams();
  function handleClick() {
    void setParams({ orderId: order.id });
  }

  return (
    <Card
      role="button"
      onClick={handleClick}
      className="ring-accent cursor-pointer transition-shadow hover:ring-2"
    >
      <CardHeader>
        <div className="flex justify-between gap-3">
          <CardTitle>Order #{order.id}</CardTitle>
          <PaymentMethod method={order.paymentMethod} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground font-medium">Ordered At</p>
          <p className="text-lg font-medium">{formatDate(order.createdAt)}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground font-medium">Total Amount</p>

          <p className="text-lg font-medium">
            {formatCurrency(order.totalPrice)}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button size="lg">
          <EyeIcon />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

export function OrderCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}

export function OrderCardsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
