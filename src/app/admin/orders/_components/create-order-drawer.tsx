"use client";

import { useMutation } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "~/components/ui/toast";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTRPC } from "~/trpc/client";
import { OrderForm, type OrderFormValues } from "../../_components/forms/order";
import { useOrderSearchParams } from "../../_hooks/use-order-search-params";
import { useRefreshOrderViews } from "../../_hooks/use-refresh-order-views";

export function CreateOrderDrawer() {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const refreshOrderViews = useRefreshOrderViews();
  const [params, setParams] = useOrderSearchParams();
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation(
    trpc.admin.orders.mutations.create.mutationOptions({
      onSuccess: () => {
        void refreshOrderViews();
        toast.success("Order created successfully");
        void setParams({ create: null });
      },
      onError: (error) => {
        toast.error(
          error.message ||
            "Couldn't create the order. Check each item has enough stock.",
        );
      },
    }),
  );

  function onSubmit(values: OrderFormValues) {
    createOrder(values);
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      void setParams({ create: true });
      return;
    }
    void setParams({ create: null });
  }

  return (
    <Drawer
      swipeDirection={isMobile ? "down" : "right"}
      open={Boolean(params.create)}
      onOpenChange={handleOpenChange}
    >
      <DrawerTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Create Order
      </DrawerTrigger>
      <DrawerContent className="data-[swipe-direction=right]:sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle className="text-lg">New order</DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="pt-2">
          <OrderForm onSubmit={onSubmit} />
        </DrawerBody>
        <DrawerFooter>
          <Button type="submit" form="order-form" disabled={isCreatingOrder}>
            {isCreatingOrder ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            Create order
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
