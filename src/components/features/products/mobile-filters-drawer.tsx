"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("products.filters");
  const [open, setOpen] = useState(false);
  useCloseOnBack(open, () => setOpen(false));

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={<Button variant="outline" className="lg:hidden" />}
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        {t("title")}
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <DrawerHeader className="px-4 text-start">
          <DrawerTitle className="text-title">{t("title")}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {t("description")}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="px-4 pb-8">{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
