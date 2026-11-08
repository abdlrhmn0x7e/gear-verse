"use client";

import { IconExternalLink } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { PackageOpenIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { PaymentMethod } from "~/components/payment-method";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DialogTitle } from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Skeleton } from "~/components/ui/skeleton";
import { useIsMobile } from "~/hooks/use-mobile";
import { googleMapsUrl } from "~/lib/google-maps";
import { formatCurrency } from "~/lib/utils/format-currency";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useOrderSearchParams } from "../../_hooks/use-order-search-params";
import { DeleteOrderDialog } from "../dialogs/delete-order";
import { OrderStatus } from "../tables/orders/order-status";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { EditOrderDrawer } from "../../orders/_components/edit-order-drawer";
import { formatAddressLine, telLink } from "../../(index)/_components/format";
import { CopyButton, CopyIconSwap, useCopyToClipboard } from "../copy-button";
import { RenameGuestDrawer } from "./rename-guest-drawer";

export function OrderDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useOrderSearchParams();

  function handleOpenChange(open: boolean) {
    if (open) {
      return;
    }
    void setParams((prev) => ({ ...prev, orderId: null, editId: null }));
  }

  // an edit always opens over the order's details, so an edit link on its own opens them too
  return (
    <Drawer
      open={!!(params.orderId ?? params.editId)}
      onOpenChange={handleOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="data-[swipe-direction=right]:sm:max-w-xl">
        <OrderDrawerContent />
        <EditOrderDrawer />
      </DrawerContent>
    </Drawer>
  );
}

function OrderDrawerContent() {
  const trpc = useTRPC();
  const [params, setParams] = useOrderSearchParams();
  const orderId = params.orderId ?? params.editId;
  const [renaming, setRenaming] = useState(false);
  const { copied: shippingCopied, copy } = useCopyToClipboard();

  const paramsProductIdRef = useRef<number | null>(orderId);
  const { data, isPending } = useQuery(
    trpc.admin.orders.queries.findDetailsById.queryOptions(
      {
        // eslint-disable-next-line react-hooks/refs
        id: paramsProductIdRef.current!,
      },
      {
        // eslint-disable-next-line react-hooks/refs
        enabled: !!paramsProductIdRef.current,
      },
    ),
  );

  if (isPending || !data) {
    return <OrderDrawerSkeleton />;
  }

  function handleDeleteSuccess() {
    void setParams({ orderId: null, editId: null });
  }

  const { address, user } = data;
  const total = data.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0,
  );
  const addressLine = formatAddressLine(address);
  const mapsUrl = googleMapsUrl(address);
  const accountName = user?.name ?? address?.fullName;

  // what a courier needs to deliver it, in the order they read it
  const shippingDetails = [
    address?.fullName,
    address?.phoneNumber,
    addressLine,
    mapsUrl,
    `Order #${data.id}`,
    data.paymentMethod === "COD"
      ? `Cash on delivery: ${formatCurrency(total, "en")}`
      : "Prepaid",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <DrawerHeader className="gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 text-start">
            <DrawerTitle>
              Order <span className="tabular-nums">#{data.id}</span>
            </DrawerTitle>
            <DrawerDescription className="tabular-nums">
              Placed {format(data.createdAt, "dd MMM yyyy, HH:mm")}
            </DrawerDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Edit order"
              onClick={() => setParams({ editId: data.id })}
            >
              <PencilIcon />
            </Button>

            <DeleteOrderDialog
              variant="destructive-outline"
              showText={false}
              size="icon"
              id={orderId!}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            void copy(shippingDetails, {
              success: "Shipping details copied",
              error: "Couldn't copy the shipping details. Try again.",
            })
          }
        >
          <CopyIconSwap copied={shippingCopied} />
          Copy shipping details
        </Button>
      </DrawerHeader>

      <div className="max-h-full space-y-6 divide-y overflow-y-auto px-4 [&>section]:pb-6 [&>section:last-child]:pb-0">
        <DetailSection title="Customer">
          <DetailRow
            label="Account"
            value={
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={user?.image ?? ""} alt="" />
                  <AvatarFallback>
                    {accountName?.charAt(0) ?? ""}
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground min-w-0 truncate">
                  {accountName}
                </span>
                {user?.isAnonymous && <Badge variant="secondary">Guest</Badge>}
              </div>
            }
          />
          {user && !user.isAnonymous && (
            <DetailRow
              label="Email"
              value={<span className="break-all">{user.email}</span>}
            />
          )}
          {user && (
            <DetailRow
              label="Orders placed"
              value={
                <div className="flex items-center gap-3">
                  <span className="tabular-nums">{user.orderCount}</span>
                  {/* the users list leaves guests out, so their drawer can't open */}
                  {!user.isAnonymous && (
                    <Link
                      href={`/admin/users?ordersOf=${user.id}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      View all
                    </Link>
                  )}
                </div>
              }
            />
          )}
          {user?.isAnonymous && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setRenaming(true)}
              >
                <PencilIcon data-icon="inline-start" />
                Set name
              </Button>
              <RenameGuestDrawer
                userId={user.id}
                defaultName={address?.fullName ?? ""}
                open={renaming}
                onOpenChange={setRenaming}
              />
            </>
          )}
        </DetailSection>

        {address && (
          <DetailSection title="Delivery">
            <DetailRow
              label="Recipient"
              value={
                <CopyableValue
                  text={address.fullName}
                  label="Copy recipient name"
                  success="Recipient name copied"
                />
              }
            />
            <DetailRow
              label="Phone"
              value={
                <CopyableValue
                  text={address.phoneNumber}
                  label="Copy phone number"
                  success="Phone number copied"
                >
                  <a
                    href={telLink(address.phoneNumber)}
                    className="text-foreground tabular-nums underline-offset-4 hover:underline"
                  >
                    {address.phoneNumber}
                  </a>
                </CopyableValue>
              }
            />
            <DetailRow
              label="Address"
              value={
                <CopyableValue
                  text={addressLine}
                  label="Copy address"
                  success="Address copied"
                />
              }
            />
            {mapsUrl && (
              <DetailRow
                label="Location"
                value={<PinnedLocation url={mapsUrl} />}
              />
            )}
          </DetailSection>
        )}

        <DetailSection title="Order">
          <DetailRow
            label="Order no."
            value={<span className="tabular-nums">#{data.id}</span>}
          />
          <DetailRow
            label="Status"
            value={<OrderStatus status={data.status} />}
          />
          <DetailRow
            label="Payment method"
            value={<PaymentMethod method={data.paymentMethod} />}
          />
          <DetailRow
            label="Placed at"
            value={
              <span className="tabular-nums">
                {format(data.createdAt, "dd MMM yyyy, HH:mm")}
              </span>
            }
          />
          <DetailRow
            label="Last updated"
            value={
              <span className="tabular-nums">
                {format(data.updatedAt, "dd MMM yyyy, HH:mm")}
              </span>
            }
          />
        </DetailSection>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Heading level={4}>Order Items</Heading>
            <p className="text-muted-foreground text-sm">
              Total Amount - {formatCurrency(total, "en")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {data.items.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PackageOpenIcon />
                  </EmptyMedia>
                  <EmptyTitle>No order items</EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              data.items.map((item, index) => (
                <OrderItem key={`${item.id}-${index}`} item={item} />
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <Heading level={4}>{title}</Heading>
      {children}
    </section>
  );
}

/** A value with a small copy button after it; `children` replaces the plain text, e.g. with a link. */
function CopyableValue({
  text,
  label,
  success,
  children,
}: {
  text: string;
  label: string;
  success: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-1">
      <span className="min-w-0 pt-0.5">{children ?? text}</span>
      <CopyButton text={text} label={label} success={success} />
    </div>
  );
}

function OrderItem({
  item,
}: {
  item: RouterOutput["admin"]["orders"]["queries"]["findDetailsById"]["items"][number];
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
          href={`/admin/products?id=${item.productId}`}
          className="font-medium text-pretty hover:underline"
        >
          {item.quantity} x {item.title}
        </Link>
        {item.values && item.values.length > 0 && (
          <p className="text-muted-foreground text-sm">
            {item.values.join(", ")}
          </p>
        )}
        {item.backorderedQuantity > 0 && (
          <Badge variant="warning">
            {item.backorderedQuantity === item.quantity
              ? "Backorder"
              : `${item.backorderedQuantity} of ${item.quantity} on backorder`}
          </Badge>
        )}

        <p className="text-muted-foreground ml-auto">
          {formatCurrency(item.quantity * item.price, "en")}
        </p>
      </div>
    </div>
  );
}

function PinnedLocation({ url }: { url: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="-ml-2.5 flex flex-wrap gap-1">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<a href={url} target="_blank" rel="noreferrer" />}
      >
        <IconExternalLink data-icon="inline-start" />
        Open in Google Maps
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          void copy(url, {
            success: "Location link copied",
            error: "Couldn't copy the link. Open it in Google Maps instead.",
          })
        }
      >
        <CopyIconSwap copied={copied} />
        Copy location link
      </Button>
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
    <div className="grid grid-cols-2 gap-2">
      <p>{label}</p>
      <div className="text-muted-foreground min-w-0">{value}</div>
    </div>
  );
}

function OrderDrawerSkeleton() {
  return (
    <>
      <DrawerHeader>
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </DrawerHeader>
      <div className="max-h-full space-y-6 divide-y overflow-y-auto px-4 [&>div]:pb-6 [&>div:last-child]:pb-0">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-24 shrink-0 rounded-md" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="ml-auto h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
