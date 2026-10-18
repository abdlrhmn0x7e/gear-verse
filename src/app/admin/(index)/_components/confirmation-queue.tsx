"use client";

import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { CircleCheckIcon, ClockIcon, PhoneIcon, TruckIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "~/components/ui/toast";
import { Badge } from "~/components/reui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useRefreshOrderViews } from "../../_hooks/use-refresh-order-views";
import {
  firstName,
  formatAge,
  formatGovernorate,
  formatMoney,
  isOverdue,
  telLink,
  whatsAppConfirmationLink,
} from "./format";
import { Panel, PanelEmpty } from "./panel";

type PendingOrder =
  RouterOutput["admin"]["dashboard"]["queries"]["pending"]["orders"][number];

const DESCRIPTION =
  "Call or WhatsApp each order to confirm it and collect the shipping fee before it ships.";

/** Pending orders, oldest first: who to call, what they ordered, and the three things to do about it. */
export function ConfirmationQueue({ className }: { className?: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.pending.queryOptions(),
  );
  const now = new Date();

  return (
    <Panel
      title="Needs confirmation"
      titleContent={
        data.count > 0 && (
          <Badge
            variant="secondary"
            radius="full"
            className="bg-accent tabular-nums"
          >
            {data.count}
          </Badge>
        )
      }
      description={DESCRIPTION}
      link={{ href: "/admin/orders?status=PENDING", label: "View all orders" }}
      className={className}
    >
      {data.orders.length === 0 ? (
        <PanelEmpty icon={<CircleCheckIcon />}>
          You&apos;re all caught up. New orders will wait here for their
          confirmation call.
        </PanelEmpty>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {data.orders.map((order) => (
            <QueueRow key={order.id} order={order} now={now} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function itemSummary(order: PendingOrder) {
  const [only] = order.lines;
  if (order.lines.length === 1 && only) {
    return { title: only.title, suffix: `×${only.quantity}` };
  }
  return { title: `${order.quantity} items`, suffix: null };
}

function QueueRow({ order, now }: { order: PendingOrder; now: Date }) {
  const overdue = isOverdue(order.createdAt, now);
  const items = itemSummary(order);
  const area = [
    order.city,
    order.governorate && formatGovernorate(order.governorate),
  ]
    .filter(Boolean)
    .join(", ");
  const whatsApp = order.phoneNumber
    ? whatsAppConfirmationLink({
        phone: order.phoneNumber,
        customerName: order.customerName,
        orderId: order.id,
        total: order.total,
      })
    : null;

  return (
    <li className="@container/row py-3">
      <div className="flex flex-col gap-2.5 @xl/row:flex-row @xl/row:items-center @xl/row:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex min-w-0 items-baseline gap-2">
              <span className="truncate font-medium">{order.customerName}</span>
              <Link
                href={`/admin/orders?orderId=${order.id}`}
                className="text-muted-foreground hover:text-foreground shrink-0 text-xs tabular-nums underline-offset-4 hover:underline"
              >
                #{order.id}
              </Link>
            </p>
            <p className="text-muted-foreground flex min-w-0 gap-1 text-xs">
              {area && <span className="shrink-0">{area} ·</span>}
              <span className="truncate" title={items.title}>
                {items.title}
              </span>
              {items.suffix && (
                <span className="shrink-0 tabular-nums">{items.suffix}</span>
              )}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-medium tabular-nums">
              {formatMoney(order.total)}
            </p>
            <p
              className={cn(
                "flex items-center justify-end gap-1 text-xs tabular-nums",
                overdue
                  ? "text-warning-foreground font-medium"
                  : "text-muted-foreground",
              )}
              suppressHydrationWarning
            >
              <ClockIcon aria-hidden className="size-3" />
              <span className="sr-only">Waiting </span>
              {formatAge(order.createdAt, now)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {order.phoneNumber && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href={telLink(order.phoneNumber)} />}
            >
              <PhoneIcon data-icon="inline-start" />
              Call
            </Button>
          )}
          {whatsApp && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a href={whatsApp} target="_blank" rel="noopener noreferrer" />
              }
            >
              <IconBrandWhatsapp data-icon="inline-start" />
              WhatsApp
            </Button>
          )}
          <MarkShippedButton order={order} />
        </div>
      </div>
    </li>
  );
}

function MarkShippedButton({ order }: { order: PendingOrder }) {
  const trpc = useTRPC();
  const refreshOrderViews = useRefreshOrderViews();
  const { mutate, isPending } = useMutation(
    trpc.admin.orders.mutations.update.mutationOptions({
      onSuccess: () => {
        toast.success(`Order #${order.id} marked as shipped`);
        void refreshOrderViews();
      },
      onError: () => {
        toast.error(`Couldn't mark order #${order.id} as shipped. Try again.`);
      },
    }),
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline" size="sm" disabled={isPending} />}
      >
        <TruckIcon data-icon="inline-start" />
        Mark shipped
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Mark order #{order.id} as shipped?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Only ship once {firstName(order.customerName)} has confirmed the
            order and paid the shipping fee. It leaves this queue and its status
            becomes Shipped.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutate({ id: order.id, status: "SHIPPED" })}
          >
            <TruckIcon data-icon="inline-start" />
            Mark shipped
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ConfirmationQueueSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <Panel
      title="Needs confirmation"
      description={DESCRIPTION}
      className={className}
    >
      <ul className="divide-border flex flex-col divide-y">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 py-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-8 w-56 rounded-full" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
