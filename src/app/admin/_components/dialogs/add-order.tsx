"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";
import { OrderForm, type OrderFormValues } from "../forms/order-form";

const CREATE_ORDER_FORM_ID = "create-order-form";

export function AddOrderDialog() {
  const [open, setOpen] = useState(false);

  function onSubmit(values: OrderFormValues) {
    console.log(values);
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger asChild>
        <Button>
          <PlusIcon />
          Create a new order
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent className="sm:max-w-xl">
        <DrawerDialogHeader>
          <DrawerDialogTitle>Create a new order</DrawerDialogTitle>
          <DrawerDialogDescription>
            Fill out the information below to create an order manually.
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <OrderForm
          formId={CREATE_ORDER_FORM_ID}
          onSubmit={onSubmit}
          isBusy={false}
        />

        <DrawerDialogFooter>
          <Button type="submit" form={CREATE_ORDER_FORM_ID} disabled={false}>
            {false ? "Creating..." : "Create Order"}
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
