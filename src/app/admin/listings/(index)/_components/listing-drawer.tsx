"use client";

import { ShoppingBagIcon } from "lucide-react";
import { useMemo } from "react";
import { useListingSearchParams } from "~/app/admin/_components/tables/listing/hooks";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { VerseCarousel } from "~/components/verse-carousel";
import { useIsMobile } from "~/hooks/use-mobile";
import { api } from "~/trpc/react";

export function ListingDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useListingSearchParams();

  function handleClose() {
    void setParams({
      ...params,
      listingId: null,
    });
  }

  return (
    <Drawer
      open={!!params.listingId}
      onOpenChange={handleClose}
      direction={isMobile ? "bottom" : "right"}
      handleOnly={!isMobile}
    >
      <ListingDrawerContent />
    </Drawer>
  );
}

function ListingDrawerContent() {
  const [params] = useListingSearchParams();
  const {
    data: listing,
    isPending: listingPending,
    isError: listingError,
  } = api.listing.queries.findById.useQuery(
    {
      id: params.listingId ?? 0,
    },
    {
      enabled: !!params.listingId,
    },
  );
  const photos = useMemo(() => {
    const photos = [];
    if (listing?.thumbnail) {
      photos.push(listing.thumbnail);
    }
    if (listing?.products) {
      listing.products.forEach((product) => {
        photos.push(...product.images);
      });
    }

    return photos;
  }, [listing]);

  if (listingPending) {
    return (
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <DrawerHeader>
          <DrawerTitle>Loading...</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    );
  }

  if (listingError) {
    return (
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <DrawerHeader>
          <DrawerTitle>Error</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    );
  }

  return (
    <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
      <DrawerHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShoppingBagIcon className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>{listing.title}</DrawerTitle>
              <DrawerDescription>{listing.description}</DrawerDescription>
            </div>
          </div>
        </div>
      </DrawerHeader>
      <div className="p-4">
        <VerseCarousel photos={photos} />
      </div>
    </DrawerContent>
  );
}
