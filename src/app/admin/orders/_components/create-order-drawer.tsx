"use client";

import { IconShoppingCartPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTRPC } from "~/trpc/client";
import { OrderForm, type OrderFormValues } from "../../_components/forms/order";
import { useOrderSearchParams } from "../../_hooks/use-order-search-params";

export function CreateOrderDrawer() {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [params, setParams] = useOrderSearchParams();
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation(
    trpc.admin.orders.mutations.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.orders.queries.getPage.infiniteQueryFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.admin.inventoryItems.queries.getPage.infiniteQueryFilter(),
        );
        toast.success("Order created successfully");
        void setParams({ create: null });
      },
      onError: () => {
        toast.error(
          "Something went wrong! Probably one of the items quantatity is larger than the available stock.",
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
      direction={isMobile ? "bottom" : "right"}
      open={Boolean(params.create)}
      onOpenChange={handleOpenChange}
    >
      <DrawerTrigger asChild>
        <Button size="lg">
          <PlusIcon />
          Create Order
        </Button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Create New Order</DrawerTitle>
          <DrawerDescription>
            Fill in the details below to create a new order.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <OrderForm onSubmit={onSubmit} />
        </DrawerBody>
        <DrawerFooter>
          <Button type="submit" form="order-form" disabled={isCreatingOrder}>
            {isCreatingOrder ? <Spinner /> : <IconShoppingCartPlus />}
            Create Order
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
