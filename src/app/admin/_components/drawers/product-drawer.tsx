"use client";

import { useIsMobile } from "~/hooks/use-mobile";
import { useProductSearchParams } from "../../_hooks/use-product-search-params";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

import { useCallback } from "react";
import { DeleteProductDialog } from "../dialogs/delete-product";

export function ProductDrawer({ children }: { children?: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [params, setParams] = useProductSearchParams();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        return;
      }

      void setParams(() => ({ id: null, slug: null }));
    },
    [setParams],
  );

  return (
    <Drawer
      open={!!params.slug}
      onOpenChange={handleOpenChange}
      direction={isMobile ? "bottom" : "right"}
      handleOnly={!isMobile}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl">
        <DrawerHeader className="items-center justify-between gap-2 lg:flex-row">
          <div className="space-y-1">
            <DrawerTitle>Product Details</DrawerTitle>
            <DrawerDescription>
              View and manage detailed information about this product.
            </DrawerDescription>
          </div>

          <div className="flex items-center">
            <Button variant="outline" asChild>
              <Link href={`/admin/products/${params.id}`}>
                <PencilIcon />
                Edit
              </Link>
            </Button>

            <DeleteProductDialog
              variant="destructive-outline"
              id={params.id!}
              className="ml-2"
            />
          </div>
        </DrawerHeader>

        <div className="mr-2 overflow-y-auto">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
