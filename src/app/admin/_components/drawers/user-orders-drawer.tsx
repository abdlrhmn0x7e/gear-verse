"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRightIcon, ReceiptTextIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { PaymentMethod } from "~/components/payment-method";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { useIsMobile } from "~/hooks/use-mobile";
import { formatCurrency } from "~/lib/utils/format-currency";
import { useTRPC } from "~/trpc/client";
import { useUserSearchParams } from "../../_hooks/use-user-search-params";
import { OrderStatus } from "../tables/orders/order-status";

/**
 * A user's recent orders, opened from the users list. The orders list has no
 * customer filter, so they're listed here, each opening on the orders page.
 */
export function UserOrdersDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useUserSearchParams();

  return (
    <Drawer
      open={!!params.ordersOf}
      onOpenChange={(open) => !open && void setParams({ ordersOf: null })}
      direction={isMobile ? "bottom" : "right"}
      handleOnly={!isMobile}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
        <UserOrdersDrawerContent />
      </DrawerContent>
    </Drawer>
  );
}

function UserOrdersDrawerContent() {
  const trpc = useTRPC();
  const [params] = useUserSearchParams();
  // Held from opening, so the list doesn't blank out while the drawer closes.
  const userIdRef = useRef(params.ordersOf);
  const { data, isPending } = useQuery(
    trpc.admin.users.queries.getOrders.queryOptions(
      // eslint-disable-next-line react-hooks/refs
      { userId: userIdRef.current! },
      // eslint-disable-next-line react-hooks/refs
      { enabled: !!userIdRef.current },
    ),
  );

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Orders</DrawerTitle>
        {/* a div, since the loading skeleton is one and can't sit in a paragraph */}
        <DrawerDescription className="truncate" asChild>
          <div>
            {isPending ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              `${data?.user.name ?? "This user"}'s most recent orders`
            )}
          </div>
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
        {isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : !data || data.orders.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptTextIcon />
              </EmptyMedia>
              <EmptyTitle>No orders yet</EmptyTitle>
              <EmptyDescription>
                Orders this user places show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders?orderId=${order.id}`}
                  className="hover:bg-muted/60 group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-center gap-2 font-medium tabular-nums">
                      #{order.id}
                      <OrderStatus status={order.status} />
                    </span>
                    <span className="text-muted-foreground flex items-center gap-2 text-xs whitespace-nowrap tabular-nums">
                      {format(order.createdAt, "dd MMM, yyyy")}
                      <PaymentMethod method={order.paymentMethod} />
                    </span>
                  </div>
                  <span className="text-sm tabular-nums">
                    {formatCurrency(Number(order.totalPrice ?? 0))}
                  </span>
                  <ArrowRightIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
