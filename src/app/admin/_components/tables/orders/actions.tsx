"use client";

import { ClockFadingIcon, PencilIcon, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
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

export function OrdersTableActions({ id }: { id: number }) {
  const trpc = useTRPC();
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
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Open menu">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Order Actions</DropdownMenuLabel>

        <DropdownMenuGroup className="w-3xs space-y-1">
          <DropdownMenuItem asChild>
            <Link href={`/admin/orders?editId=${id}`}>
              <PencilIcon className="text-muted-foreground" />
              Edit
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ClockFadingIcon />
              Change Status
            </DropdownMenuSubTrigger>

            <DropdownMenuPortal>
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
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DeleteOrderDialog id={id} className="w-full justify-start" />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
