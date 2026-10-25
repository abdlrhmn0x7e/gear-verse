"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  LogInIcon,
  PackageIcon,
} from "lucide-react";
import { Link } from "~/i18n/navigation";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { LoadMore } from "~/components/load-more";
import { LoginDrawerDialog } from "~/components/login-drawer-dialog";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency } from "~/lib/utils/format-currency";
import { formatDate } from "~/lib/utils/format-date";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import {
  OrderStatusLabel,
  orderNextStep,
} from "../../_components/order-status";
import { OrderThumbnail } from "../../_components/order-details";
import { SaveOrdersPrompt } from "../../_components/save-orders-prompt";
import { useOrderDrawer } from "../_hooks/use-orders-search-params";
import { useLocale } from "next-intl";

type OrderSummary =
  RouterOutput["public"]["orders"]["queries"]["getPage"]["data"][number];

const MAX_THUMBNAILS = 4;

export function OrderCards({ isGuest }: { isGuest: boolean }) {
  const trpc = useTRPC();
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
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

  const orders = useMemo(() => data.pages.flatMap((page) => page.data), [data]);

  if (orders.length === 0) {
    return <OrdersEmpty isGuest={isGuest} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {isGuest && <SaveOrdersPrompt callbackURL="/orders" />}

      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>

      <LoadMore ref={ref} hasNextPage={hasNextPage} />
    </div>
  );
}

function OrdersEmpty({ isGuest }: { isGuest: boolean }) {
  return (
    <div className="bg-card flex flex-col items-center gap-5 rounded-3xl px-6 py-16 text-center">
      <PackageIcon
        className="text-muted-foreground size-10"
        strokeWidth={1.5}
        aria-hidden
      />
      <div className="max-w-sm space-y-1">
        <h2 className="font-medium">No orders yet</h2>
        <p className="text-muted-foreground text-sm text-pretty">
          When you place an order, you can follow it here, from our confirmation
          message to your door.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/products" />}
        >
          Browse the store
          <ArrowRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
        </Button>
        {isGuest && (
          <LoginDrawerDialog callbackURL="/orders">
            <Button variant="ghost" size="lg">
              <LogInIcon data-icon="inline-start" />
              Ordered with Google before? Sign in
            </Button>
          </LoginDrawerDialog>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderSummary }) {
  const locale = useLocale();
  const drawer = useOrderDrawer();
  const thumbnails = order.items.slice(0, MAX_THUMBNAILS);
  const hidden = order.items.length - thumbnails.length;

  return (
    <li className="bg-card hover:bg-accent/60 has-focus-visible:outline-focus has-[button:active]:bg-accent relative rounded-3xl p-5 transition-[background-color,scale] duration-150 ease-out has-focus-visible:outline-2 has-focus-visible:outline-offset-2 motion-safe:has-[button:active]:scale-[0.99]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-medium">
            {/* the button stretches over the card, so the whole card opens the order */}
            <button
              type="button"
              onClick={() => drawer.open(order.id)}
              className="cursor-pointer text-start outline-none after:absolute after:inset-0 after:rounded-3xl"
            >
              Order #{order.id}
              <span className="sr-only">, view details</span>
            </button>
          </h2>
          <p className="text-muted-foreground text-sm">
            Placed {formatDate(order.createdAt, locale)}
          </p>
        </div>
        <ChevronRightIcon
          className="text-muted-foreground mt-0.5 size-5 shrink-0 rtl:-scale-x-100"
          aria-hidden
        />
      </div>

      {thumbnails.length > 0 && (
        <ul className="mt-4 flex gap-2" aria-label="Items">
          {thumbnails.map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <OrderThumbnail
                src={item.thumbnailUrl}
                alt={item.title}
                size={56}
              />
            </li>
          ))}
          {hidden > 0 && (
            <li className="bg-input-background text-muted-foreground flex size-14 items-center justify-center rounded-xl text-sm font-medium tabular-nums">
              +{hidden}
              <span className="sr-only"> more</span>
            </li>
          )}
        </ul>
      )}

      <div className="mt-4 space-y-1">
        <OrderStatusLabel status={order.status} />
        <p className="text-muted-foreground text-sm text-pretty">
          {orderNextStep(order.status, order.paymentMethod)}
        </p>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4 border-t pt-4 text-sm">
        <p className="text-muted-foreground tabular-nums">
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
        </p>
        <p className="text-end">
          <span className="text-base font-medium tabular-nums">
            {formatCurrency(order.totalPrice, locale)}
          </span>
          {order.status !== "CANCELLED" && (
            <span className="text-muted-foreground"> + shipping</span>
          )}
        </p>
      </div>
    </li>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl p-5">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="size-14 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-4 h-4 w-36" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <div className="mt-4 flex justify-between border-t pt-4">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
}

export function OrderCardsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </div>
  );
}
