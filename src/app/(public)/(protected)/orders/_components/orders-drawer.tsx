"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useOrdersSearchParams } from "../_hooks/use-orders-search-params";
import { useIsMobile } from "~/hooks/use-mobile";
import { api, type RouterOutputs } from "~/trpc/react";
import { formatCurrency } from "~/lib/utils/format-currency";
import { PaymentMethod } from "../../_components/payment-method";
import { Separator } from "~/components/ui/separator";
import { ImageWithFallback } from "~/components/image-with-fallback";
import Header from "~/components/header";
import { PackageOpenIcon } from "lucide-react";

export function OrdersDrawer() {
  const [params, setParams] = useOrdersSearchParams();
  const { data: order, isPending: orderPending } =
    api.public.orders.queries.findById.useQuery(
      {
        id: params.orderId ?? 0,
      },
      {
        enabled: !!params.orderId,
      },
    );
  const isMobile = useIsMobile();

  function handleClose() {
    void setParams({ orderId: null });
  }

  return (
    <Drawer
      open={!!params.orderId}
      onOpenChange={handleClose}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <DrawerHeader>
          <DrawerTitle>
            <Header
              title="Order Details"
              description=""
              Icon={PackageOpenIcon}
            />
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {!orderPending && order && <OrderDetails order={order} />}
      </DrawerContent>
    </Drawer>
  );
}

function OrderDetails({
  order,
}: {
  order: RouterOutputs["public"]["orders"]["queries"]["findById"];
}) {
  return (
    <div className="space-y-6 px-4 pb-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground font-medium">Order ID</p>
          <p className="font-medium">{order.id}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground font-medium">Payment Method</p>

          <PaymentMethod paymentMethod={order.paymentMethod} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground font-medium">Total Price</p>
          <p className="font-medium">
            {formatCurrency(
              order.items.reduce(
                (acc, item) => acc + item.quantity * item.price,
                150,
              ),
            )}
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2 divide-y [&>div]:py-4">
        {order.items.map((item, index) => (
          <div key={`item-${item.title}-${index}`} className="flex gap-4">
            <ImageWithFallback
              src={item.thumbnailUrl}
              alt={item.title}
              className="size-24 shrink-0"
              width={512}
              height={512}
            />

            <div>
              <p className="font-medium">{`${item.quantity}x ${item.title} ${item.values && `- ${item.values.join(", ")}`}`}</p>
              <p className="text-muted-foreground line-clamp-3 text-sm">
                {item.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
