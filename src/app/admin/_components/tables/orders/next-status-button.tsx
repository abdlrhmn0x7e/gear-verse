"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/toast";
import { useTRPC } from "~/trpc/client";
import { useRefreshOrderViews } from "../../../_hooks/use-refresh-order-views";
import {
  nextOrderStatus,
  orderStatusMap,
  type OrderStatusValue,
} from "./order-status";

type Order = {
  id: number;
  status: OrderStatusValue;
  trackingNumber?: string | null;
};

/**
 * Moves an order one step along Pending → Confirmed → Shipped → Delivered.
 * Shipping asks for the Aramex tracking number first; the other steps take
 * one click. Renders nothing for a final status.
 */
export function NextStatusButton({ order }: { order: Order }) {
  const next = nextOrderStatus[order.status];
  const trpc = useTRPC();
  const refreshOrderViews = useRefreshOrderViews();
  const { mutate, isPending } = useMutation(
    trpc.admin.orders.mutations.update.mutationOptions({
      onSuccess: (_, input) => {
        toast.success(
          `Order #${order.id} is now ${orderStatusMap[input.status!].label.toLowerCase()}`,
        );
        void refreshOrderViews();
      },
      onError: (error) => {
        toast.error(
          error.message || `Couldn't update order #${order.id}. Try again.`,
        );
      },
    }),
  );

  if (!next) return null;

  const label = (
    <>
      {orderStatusMap[next.status].icon}
      {next.action}
    </>
  );

  if (next.status === "SHIPPED") {
    return (
      <ShipDialog
        order={order}
        disabled={isPending}
        onShip={(trackingNumber) =>
          mutate({ id: order.id, status: "SHIPPED", trackingNumber })
        }
      >
        {label}
      </ShipDialog>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={(event) => {
        // rows open the order drawer on click
        event.stopPropagation();
        mutate({ id: order.id, status: next.status });
      }}
    >
      {label}
    </Button>
  );
}

function ShipDialog({
  order,
  disabled,
  onShip,
  children,
}: {
  order: Order;
  disabled: boolean;
  onShip: (trackingNumber: string | null) => void;
  children: React.ReactNode;
}) {
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber ?? "",
  );
  const inputId = `ship-tracking-${order.id}`;

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Ship order #{order.id}?</AlertDialogTitle>
          <AlertDialogDescription>
            Its status becomes Shipped and the customer sees it on its way.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor={inputId}>Aramex tracking number</FieldLabel>
          <Input
            id={inputId}
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            inputMode="numeric"
            autoComplete="off"
            maxLength={64}
          />
          <FieldDescription>
            Optional. The customer gets a Track your package button with it.
          </FieldDescription>
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onShip(trackingNumber.trim() || null)}
          >
            {children}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
