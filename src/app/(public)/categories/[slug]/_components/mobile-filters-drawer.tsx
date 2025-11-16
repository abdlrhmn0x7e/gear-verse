import { IconFilter } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Filters } from "./filters";

export function MobileFiltersDrawer({ slug }: { slug: string }) {
  return (
    <Drawer>
      <DrawerTrigger className="block lg:hidden" asChild>
        <Button size="icon-lg" variant="outline">
          <IconFilter />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="py-4 text-center">Filters</DrawerTitle>
        <DrawerDescription></DrawerDescription>
        <DrawerBody>
          <Filters slug={slug} isMobile />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
