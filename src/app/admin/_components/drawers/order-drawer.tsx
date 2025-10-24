"use client";

import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Drawer } from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { useOrderSearchParams } from "../../_hooks/use-order-search-params";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useMemo, useRef } from "react";
import { PaymentMethod } from "~/components/payment-method";
import { OrderStatus } from "../tables/orders/order-status";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Heading } from "~/components/heading";
import { formatCurrency } from "~/lib/utils/format-currency";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { EditIcon, TrashIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function OrderDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useOrderSearchParams();

  function handleOpenChange(open: boolean) {
    if (open) {
      return;
    }
    void setParams((prev) => ({ ...prev, orderId: null }));
  }

  return (
    <Drawer
      open={!!params.orderId}
      onOpenChange={handleOpenChange}
      direction={isMobile ? "bottom" : "right"}
      handleOnly={!isMobile}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <OrderDrawerContent />
      </DrawerContent>
    </Drawer>
  );
}

function OrderDrawerContent() {
  const trpc = useTRPC();
  const [params] = useOrderSearchParams();

  const paramsProductIdRef = useRef<number>(params.orderId);
  const { data, isPending } = useQuery(
    trpc.admin.orders.queries.findById.queryOptions(
      {
        id: paramsProductIdRef.current!,
      },
      {
        enabled: !!paramsProductIdRef.current,
      },
    ),
  );

  const details = useMemo(() => {
    return [
      { label: "Order ID", value: data?.id },
      {
        label: "Payment Method",
        value: <PaymentMethod method={data?.paymentMethod ?? "COD"} />,
      },
      {
        label: "Status",
        value: <OrderStatus status={data?.status ?? "PENDING"} />,
      },
      { label: "Phone Number", value: data?.address?.phoneNumber },
      {
        label: "Address",
        value:
          data?.address?.address +
          ", " +
          data?.address?.city +
          ", " +
          data?.address?.governorate.toLowerCase(),
      },
    ];
  }, [data]);

  if (isPending) {
    return (
      <>
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle>
              <Skeleton className="h-6 w-32" />
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
          <DrawerDescription className="mt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-full space-y-6 divide-y overflow-y-auto px-4 [&>div]:pb-6 [&>div:last-child]:pb-0">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40 justify-self-end" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-24 shrink-0 rounded-md" />
                  <div className="flex w-full flex-col gap-1">
                    <Skeleton className="h-4 w-1/2" />
                    <div className="ml-auto">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DrawerHeader>
        <div className="flex items-center justify-between">
          <DrawerTitle>Order Details</DrawerTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <EditIcon className="size-4" />
            </Button>

            <Button variant="destructive-outline" size="icon">
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>
        <DrawerDescription className="mt-2">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={data?.user?.image ?? ""}
                alt={data?.user?.name ?? ""}
              />
              <AvatarFallback>
                {data?.user?.name?.charAt(0) ?? ""}
              </AvatarFallback>
            </Avatar>
            <p>{data?.user?.name ?? "your mom"}</p>
          </div>
        </DrawerDescription>
      </DrawerHeader>
      <div className="max-h-full space-y-6 divide-y overflow-y-auto px-4 [&>div]:pb-6 [&>div:last-child]:pb-0">
        <div className="flex flex-col gap-4">
          {details.map((detail) => (
            <DetailRow key={detail.label} {...detail} />
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Heading level={4}>Order Items</Heading>
            <p className="text-muted-foreground text-sm">
              Total Amount -{" "}
              {formatCurrency(
                data?.items.reduce(
                  (acc, item) => acc + item.quantity * item.price,
                  0,
                ) ?? 0,
              )}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {data?.items.map((item, index) => (
              <OrderItem key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function OrderItem({
  item,
}: {
  item: RouterOutput["admin"]["orders"]["queries"]["findById"]["items"][number];
}) {
  return (
    <div className="flex items-center gap-3">
      <ImageWithFallback
        src={item.thumbnailUrl ?? ""}
        alt={item.title}
        className="size-24 shrink-0"
        width={512}
        height={512}
      />
      <div className="flex flex-col gap-1">
        <Link
          href={`/admin/products?productId=${item.id}`}
          className="text-primary-foreground font-medium text-pretty hover:underline"
        >
          {item.quantity} x {item.title} - {item.title}
        </Link>

        <p className="text-muted-foreground ml-auto">
          {formatCurrency(item.quantity * item.price)}
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2">
      <p className="capitalize">{label}</p>
      <p className="text-muted-foreground capitalize">{value}</p>
    </div>
  );
}
