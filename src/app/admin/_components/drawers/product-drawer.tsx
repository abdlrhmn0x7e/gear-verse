"use client";

import { useIsMobile } from "~/hooks/use-mobile";
import { useProductSearchParams } from "../../_hooks/use-product-search-params";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Skeleton } from "~/components/ui/skeleton";

import { useCallback } from "react";

export function ProductDrawer({
  slug,
  children,
}: {
  /** the slug `children` was rendered for on the server */
  slug: string | null;
  children?: React.ReactNode;
}) {
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

  // a row click opens the drawer at once, while the server is still rendering
  // that product, so the last product shown must not stand in for it
  const isCurrent = !!params.slug && params.slug === slug;

  return (
    <Drawer
      open={!!params.slug}
      onOpenChange={handleOpenChange}
      direction={isMobile ? "bottom" : "right"}
      handleOnly={!isMobile}
    >
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:h-[85svh] data-[vaul-drawer-direction=bottom]:max-h-[85svh] data-[vaul-drawer-direction=right]:sm:max-w-2xl">
        {isCurrent ? children : <ProductDrawerSkeleton />}
      </DrawerContent>
    </Drawer>
  );
}

export function ProductDrawerSkeleton() {
  return (
    <>
      <DrawerHeader className="gap-2">
        <DrawerTitle className="sr-only">Loading product</DrawerTitle>
        <DrawerDescription className="sr-only">
          The product summary is loading.
        </DrawerDescription>
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-8">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <Skeleton className="h-9 w-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </DrawerBody>

      <DrawerFooter className="flex-row justify-end">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </DrawerFooter>
    </>
  );
}
