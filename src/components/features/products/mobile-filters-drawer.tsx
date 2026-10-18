"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { useCloseOnBack } from "~/hooks/use-close-on-back";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

/** Bottom sheet that hosts the same filter panel the desktop side column shows. */
export function MobileFiltersDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useCloseOnBack(open, () => setOpen(false));

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontalIcon data-icon="inline-start" />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <DrawerHeader className="px-4 text-left">
          <DrawerTitle className="text-title">Filters</DrawerTitle>
          <DrawerDescription className="sr-only">
            Narrow the products by brand and price
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="px-4 pb-8">{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
