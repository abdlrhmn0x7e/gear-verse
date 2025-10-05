"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogBody,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";

export function AddOrderDialog() {
  const [open, setOpen] = useState(false);

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

        <DrawerDialogBody>
          One day you&apos;ll grow up son. untill then, you&apos;ll be a baby.
          (a wise man)
        </DrawerDialogBody>

        <DrawerDialogFooter>
          <Button type="submit" disabled={false}>
            {false ? "Creating..." : "Create Order"}
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
