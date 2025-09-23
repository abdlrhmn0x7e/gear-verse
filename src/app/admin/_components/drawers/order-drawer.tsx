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
import { api, type RouterOutputs } from "~/trpc/react";
import { useMemo, useRef } from "react";
import { PaymentMethod } from "../tables/orders/payment-method";
import { OrderStatus } from "../tables/orders/order-status";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Heading } from "~/components/heading";
import { formatCurrency } from "~/lib/utils/format-currency";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { EditIcon, TrashIcon } from "lucide-react";

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
  const [params] = useOrderSearchParams();
  const paramsProductIdRef = useRef<number>(params.orderId);
  const { data, isPending } = api.admin.orders.findById.useQuery(
    {
      id: paramsProductIdRef.current!,
    },
    {
      enabled: !!paramsProductIdRef.current,
    },
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
      { label: "Phone Number", value: data?.phoneNumber },
      {
        label: "Address",
        value:
          data?.address.address +
          ", " +
          data?.address.city +
          ", " +
          data?.address.governorate.toLowerCase(),
      },
    ];
  }, [data]);

  if (isPending) {
    return <div>Loading...</div>;
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

            <Button variant="destructiveGhost" size="icon">
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>
        <DrawerDescription className="mt-2">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={data?.user.image ?? undefined}
                alt={data?.user.name}
              />
              <AvatarFallback>
                {data?.user.name?.charAt(0) ?? "MOM"}
              </AvatarFallback>
            </Avatar>
            <p>{data?.user.name ?? "your mom"}</p>
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
                  (acc, item) =>
                    acc + item.quantity * item.productVariant.price,
                  0,
                ) ?? 0,
              )}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {data?.items.map((item, index) => (
              <OrderItem
                key={`${item.productVariant.product.name}-${item.productVariant.name}-${index}`}
                item={item}
              />
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
  item: RouterOutputs["admin"]["orders"]["findById"]["items"][number];
}) {
  return (
    <div className="flex items-center gap-3">
      <ImageWithFallback
        src={item.productVariant.thumbnail?.url ?? ""}
        alt={item.productVariant.name}
        className="size-24 shrink-0"
        width={512}
        height={512}
      />
      <div className="flex flex-col gap-1">
        <Link
          href={`/admin/products?productId=${item.productVariant.product.id}`}
          className="text-primary-foreground font-medium text-pretty hover:underline"
        >
          {item.quantity} x {item.productVariant.product.name} -{" "}
          {item.productVariant.name}
        </Link>

        <p className="text-muted-foreground ml-auto">
          {formatCurrency(item.quantity * item.productVariant.price)}
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
