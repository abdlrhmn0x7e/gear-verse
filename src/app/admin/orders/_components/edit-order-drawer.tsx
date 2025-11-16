"use client";

import { IconShoppingCartPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "~/components/ui/drawer";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "~/components/ui/frame";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTRPC } from "~/trpc/client";
import { OrderForm, type OrderFormValues } from "../../_components/forms/order";
import { useOrderSearchParams } from "../../_hooks/use-order-search-params";

export function EditOrderDrawer() {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [params, setParams] = useOrderSearchParams();

  const { data: order, isPending: isOrderPending } = useQuery(
    trpc.admin.orders.queries.findById.queryOptions(
      {
        id: params.editId ?? 0,
      },
      {
        enabled: !!params.editId,
      },
    ),
  );

  const { mutate: updateOrder, isPending: isUpdatingOrder } = useMutation(
    trpc.admin.orders.mutations.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.orders.queries.getPage.infiniteQueryFilter(),
        );

        if (params.editId) {
          void queryClient.invalidateQueries(
            trpc.admin.orders.queries.findById.queryFilter({
              id: params.editId,
            }),
          );
        }

        toast.success("Order updated successfully");
        void setParams({ editId: null });
      },
    }),
  );

  function onEdit(values: Partial<OrderFormValues>) {
    if (!params.editId) {
      return;
    }

    updateOrder({ id: params.editId, ...values });
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      return;
    }

    void setParams({ editId: null });
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={Boolean(params.editId)}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Edit Order</DrawerTitle>
          <DrawerDescription>Edit the details of the order.</DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          {isOrderPending ? (
            <OrderFormSkeleton />
          ) : (
            order && <OrderForm onEdit={onEdit} defaultValues={order} />
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button type="submit" form="order-form" disabled={isUpdatingOrder}>
            {isUpdatingOrder ? <Spinner /> : <IconShoppingCartPlus />}
            Edit Order
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function OrderFormSkeleton() {
  return (
    <div className="space-y-8">
      {/* Payment Method Skeleton */}
      <FieldSet>
        <FieldLegend>Payment Method</FieldLegend>
        <FieldDescription>
          Select the payment method for the order.
        </FieldDescription>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </FieldSet>

      {/* Shipping Information Skeleton */}
      <FieldSet>
        <FieldLegend>Shipping Information</FieldLegend>
        <FieldDescription>
          Select or add a shipping address for this order. The chosen address
          will be used for delivery.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </Field>
          <Field>
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Order Items Skeleton */}
      <Frame>
        <FrameHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6" />
              <FrameTitle className="text-lg font-medium">
                Order Items
              </FrameTitle>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </FrameHeader>
        <FramePanel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-[100px]">Quantity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-9" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </FramePanel>
      </Frame>
    </div>
  );
}
