"use client";

import {
  ClockFadingIcon,
  HashIcon,
  MapPinIcon,
  MoreHorizontal,
  PencilIcon,
  PhoneIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DeleteOrderDialog } from "../../dialogs/delete-order";
import { useTRPC } from "~/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "~/components/ui/toast";
import { useRefreshOrderViews } from "../../../_hooks/use-refresh-order-views";
import type { OrderStatus as OrderStatusType } from "~/lib/schemas/entities";
import { OrderStatus } from "./order-status";
import { useCopyToClipboard } from "../../copy-button";

export function OrdersTableActions({
  id,
  phoneNumber,
  addressLine,
}: {
  id: number;
  phoneNumber: string | null;
  addressLine: string;
}) {
  const trpc = useTRPC();
  const { copy } = useCopyToClipboard();
  const refreshOrderViews = useRefreshOrderViews();
  const { mutate: updateOrder, isPending: isUpdatingOrder } = useMutation(
    trpc.admin.orders.mutations.update.mutationOptions({
      onSuccess: () => {
        void refreshOrderViews();
      },
      onError: (error) => {
        toast.error(
          error.message || `Couldn't change order #${id}'s status. Try again.`,
        );
      },
    }),
  );

  function changeStatus(status: OrderStatusType) {
    updateOrder({ id, status });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Open menu" />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuGroup className="w-3xs space-y-1">
          <DropdownMenuLabel>Order Actions</DropdownMenuLabel>

          <DropdownMenuItem
            render={<Link href={`/admin/orders?orderId=${id}&editId=${id}`} />}
          >
            <PencilIcon className="text-muted-foreground" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ClockFadingIcon />
              Change Status
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="w-3xs">
              <DropdownMenuItem
                onClick={() => changeStatus("PENDING")}
                disabled={isUpdatingOrder}
              >
                <OrderStatus variant="plain" status="PENDING" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeStatus("SHIPPED")}
                disabled={isUpdatingOrder}
              >
                <OrderStatus variant="plain" status="SHIPPED" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeStatus("DELIVERED")}
                disabled={isUpdatingOrder}
              >
                <OrderStatus variant="plain" status="DELIVERED" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeStatus("REFUNDED")}
                disabled={isUpdatingOrder}
              >
                <OrderStatus variant="plain" status="REFUNDED" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeStatus("CANCELLED")}
                disabled={isUpdatingOrder}
              >
                <OrderStatus variant="plain" status="CANCELLED" />
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DeleteOrderDialog id={id} className="w-full justify-start" />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Copy</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              void copy(String(id), {
                success: "Order number copied",
                error: "Couldn't copy the order number. Try again.",
              })
            }
          >
            <HashIcon className="text-muted-foreground" />
            Copy order number
          </DropdownMenuItem>
          {phoneNumber && (
            <DropdownMenuItem
              onClick={() =>
                void copy(phoneNumber, {
                  success: "Phone number copied",
                  error: "Couldn't copy the phone number. Try again.",
                })
              }
            >
              <PhoneIcon className="text-muted-foreground" />
              Copy phone number
            </DropdownMenuItem>
          )}
          {addressLine && (
            <DropdownMenuItem
              onClick={() =>
                void copy(addressLine, {
                  success: "Address copied",
                  error: "Couldn't copy the address. Try again.",
                })
              }
            >
              <MapPinIcon className="text-muted-foreground" />
              Copy address
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
