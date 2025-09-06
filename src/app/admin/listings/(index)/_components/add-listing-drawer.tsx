"use client";

import { IconShoppingBagPlus } from "@tabler/icons-react";
import {
  ListingForm,
  type ListingFormValues,
} from "~/app/admin/_components/forms/listing-form";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useIsMobile } from "~/hooks/use-mobile";

export function AddListingDrawer() {
  const isMobile = useIsMobile();
  function onSubmit(data: ListingFormValues) {
    console.log(data);
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button size="lg">
          <IconShoppingBagPlus />
          Create a new listing
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
            <IconShoppingBagPlus className="mt-1 size-6 shrink-0" />
            <div>
              <DrawerTitle>Create a new listing</DrawerTitle>
              <DrawerDescription>
                {
                  "Create a new listing to start selling your products. let's get that that fat ass money"
                }
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <ListingForm onSubmit={onSubmit} className="px-4" />
        </ScrollArea>

        <DrawerFooter>
          <Button type="submit" form="listing-form">
            Submit
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
