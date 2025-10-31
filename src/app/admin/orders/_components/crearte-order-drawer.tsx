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
import { useState } from "react";

export function CreateOrderDrawer() {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation(
    trpc.admin.orders.mutations.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.orders.queries.getPage.infiniteQueryFilter(),
        );
        toast.success("Order created successfully");
        setOpen(false);
      },
    }),
  );

  function onSubmit(values: OrderFormValues) {
    createOrder(values);
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={setOpen}
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
