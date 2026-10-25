"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Skeleton } from "~/components/ui/skeleton";
import { useIsMobile } from "~/hooks/use-mobile";
import { formatDate } from "~/lib/utils/format-date";
import { useTRPC } from "~/trpc/client";
import { OrderDetails } from "../../_components/order-details";
import { OrderStatusLabel } from "../../_components/order-status";
import { useOrderDrawer } from "../_hooks/use-orders-search-params";
import { useLocale } from "next-intl";

export function OrdersDrawer({
  whatsappNumber,
}: {
  /** E.164 from the store settings; questions go nowhere without one */
  whatsappNumber: string | null;
}) {
  const locale = useLocale();
  const trpc = useTRPC();
  const drawer = useOrderDrawer();
  // the drawer keeps showing the last order while it slides out after the param clears
  const [shownId, setShownId] = useState(drawer.orderId);
  if (drawer.orderId && drawer.orderId !== shownId) {
    setShownId(drawer.orderId);
  }
  const {
    data: order,
    isPending,
    isError,
  } = useQuery(
    trpc.public.orders.queries.findById.queryOptions(
      {
        id: shownId ?? 0,
      },
      {
        enabled: !!shownId,
        // a missing order (an old or shared link) won't turn up on a retry
        retry: (failureCount, error) =>
          error.data?.code !== "NOT_FOUND" && failureCount < 3,
      },
    ),
  );
  const isMobile = useIsMobile();

  function handleOpenChange(open: boolean) {
    if (!open) drawer.close();
  }

  return (
    <Drawer
      open={!!drawer.orderId}
      onOpenChange={handleOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="data-[swipe-direction=down]:max-h-[min(92svh,calc(var(--drawer-visible-height,100svh)-1.5rem))] data-[swipe-direction=right]:sm:max-w-xl">
        <DrawerHeader className="gap-1 px-3 pt-3 pb-4 text-start group-data-[swipe-direction=down]/drawer-content:text-start">
          <DrawerTitle className="text-title">Order #{shownId}</DrawerTitle>
          <DrawerDescription
            render={
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1" />
            }
          >
            {order ? (
              <>
                <span>Placed {formatDate(order.createdAt, locale)}</span>
                <OrderStatusLabel
                  status={order.status}
                  className="text-foreground"
                />
              </>
            ) : isError ? (
              "We couldn't load this order."
            ) : (
              <span className="sr-only">Loading the order…</span>
            )}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="px-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {order ? (
            <OrderDetails order={order} whatsappNumber={whatsappNumber} />
          ) : isPending && shownId ? (
            <div className="flex flex-col gap-3" aria-hidden>
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          ) : isError ? (
            <p className="text-muted-foreground px-2 text-sm text-pretty">
              It may belong to another account, or the link is out of date.
              Close this and pick an order from your list.
            </p>
          ) : null}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
