"use client";

import { SaveIcon, XIcon } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "~/components/ui/toast";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTRPC } from "~/trpc/client";
import {
  OrderForm,
  OrderFormSkeleton,
  type OrderFormValues,
} from "../../_components/forms/order";
import { useOrderSearchParams } from "../../_hooks/use-order-search-params";
import { useRefreshOrderViews } from "../../_hooks/use-refresh-order-views";

/** Opens over the order's details drawer, which it is rendered inside; closing or saving drops back to the details */
export function EditOrderDrawer() {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const refreshOrderViews = useRefreshOrderViews();

  const [params, setParams] = useOrderSearchParams();
  const editId = params.editId;

  const { data: order, isPending: isOrderPending } = useQuery(
    trpc.admin.orders.queries.findById.queryOptions(
      { id: editId ?? 0 },
      { enabled: !!editId },
    ),
  );
  // the details drawer underneath has already loaded this; it names the customer and items the pickers can't find
  // on their first page
  const { data: details } = useQuery(
    trpc.admin.orders.queries.findDetailsById.queryOptions(
      { id: editId ?? 0 },
      { enabled: !!editId },
    ),
  );
  const selected = useMemo(
    () =>
      order && details
        ? {
            customer: details.user?.name
              ? {
                  id: order.userId,
                  name: details.user.name,
                  image: details.user.image,
                }
              : null,
            items: details.items.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId ?? null,
              title: item.title,
              thumbnailUrl: item.thumbnailUrl,
              values: item.values ?? [],
            })),
          }
        : undefined,
    [order, details],
  );

  const { mutate: updateOrder, isPending: isUpdatingOrder } = useMutation(
    trpc.admin.orders.mutations.update.mutationOptions({
      onSuccess: () => {
        void refreshOrderViews();
        toast.success("Order updated");
        void setParams({ editId: null });
      },

      onError: (error) => {
        toast.error(
          error.message ||
            "Couldn't save the order. Check each item has enough stock.",
        );
      },
    }),
  );

  function onEdit(values: Partial<OrderFormValues>) {
    if (!editId) {
      return;
    }

    updateOrder({ id: editId, ...values });
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      return;
    }

    void setParams({ editId: null });
  }

  return (
    <Drawer
      swipeDirection={isMobile ? "down" : "right"}
      open={Boolean(editId)}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent className="data-[swipe-direction=right]:sm:max-w-xl">
        <DrawerHeader>
          <DrawerTitle className="text-lg">
            Edit order <span className="tabular-nums">#{editId}</span>
          </DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="pt-2">
          {isOrderPending ? (
            <OrderFormSkeleton />
          ) : (
            order && (
              <OrderForm
                onEdit={onEdit}
                defaultValues={order}
                selected={selected}
              />
            )
          )}
        </DrawerBody>
        <DrawerFooter className="flex-col-reverse sm:flex-row sm:justify-end">
          <DrawerClose render={<Button variant="outline" />}>
            <XIcon data-icon="inline-start" />
            Cancel
          </DrawerClose>
          <Button
            type="submit"
            form="order-form"
            disabled={isUpdatingOrder || isOrderPending}
          >
            {isUpdatingOrder ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <SaveIcon data-icon="inline-start" />
            )}
            Save order
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
