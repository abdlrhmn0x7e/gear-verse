"use client";

import {
  AlertTriangleIcon,
  EyeIcon,
  FileTextIcon,
  ImagesIcon,
  InfoIcon,
  PackageIcon,
  PencilIcon,
  ShoppingBagIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";
import Header from "~/app/admin/_components/page-header";
import { useListingSearchParams } from "~/app/admin/_hooks/use-listing-search-params";
import { DeleteProductDialog } from "~/app/admin/_components/dialogs/delete-product-dialog";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { VerseCarousel } from "~/components/verse-carousel";
import { useIsMobile } from "~/hooks/use-mobile";
import { api, type RouterOutputs } from "~/trpc/react";
import { IconShoppingBagX } from "@tabler/icons-react";
import { DeleteListingDialog } from "../dialogs/delete-listing-dialog";

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
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <ListingDrawerContent />
      </DrawerContent>
    </Drawer>
  );
}

function ListingDrawerContent() {
  const [params, setParams] = useListingSearchParams();

  const paramsListingIdRef = useRef<number>(params.listingId);
  const {
    data: listing,
    isPending: listingPending,
    isError: listingError,
  } = api.listing.findFullById.useQuery(
    {
      id: paramsListingIdRef.current ?? 0,
    },
    {
      enabled: !!paramsListingIdRef.current,
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

  console.log(listing);

  if (listingPending) {
    return <ListingDrawerSkeleton />;
  }

  if (!listing) {
    return (
      <>
        <DrawerHeader>
          <div className="flex items-start gap-3">
            <IconShoppingBagX className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>Listing not found</DrawerTitle>
              <DrawerDescription>Listing not found</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex h-full flex-col items-center justify-center gap-3">
          <InfoIcon className="text-info size-24" />
          <div className="text-center">
            <p className="text-info text-lg">Listing not found</p>
            <p className="text-muted-foreground text-sm">
              (this time it&apos;s your fault daddy)
            </p>
          </div>
        </div>
      </>
    );
  }

  if (listingError) {
    return (
      <>
        <DrawerHeader>
          <div className="flex items-start gap-3">
            <IconShoppingBagX className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>Error</DrawerTitle>
              <DrawerDescription>
                An error occurred while loading the listing
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex h-full flex-col items-center justify-center gap-3">
          <AlertTriangleIcon className="text-destructive size-24" />
          <div className="text-center">
            <p className="text-destructive text-lg">
              An error occurred while loading the listing
            </p>
            <p className="text-muted-foreground text-sm">
              (sorry daddy my bad)
            </p>
          </div>
        </div>
      </>
    );
  }

  function handleEditListing() {
    void setParams({
      ...params,
      type: "edit",
    });
  }

  function handleOnDeleteSuccess() {
    void setParams({
      ...params,
      listingId: null,
    });
  }

  return (
    <>
      <DrawerHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShoppingBagIcon className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>{listing.title}</DrawerTitle>
              <DrawerDescription>{listing.description}</DrawerDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-full flex-1 justify-start"
              onClick={handleEditListing}
            >
              <PencilIcon />
              Edit Listing
            </Button>

            <DeleteListingDialog
              id={paramsListingIdRef.current!}
              onSuccess={handleOnDeleteSuccess}
            />
          </div>
        </div>
      </DrawerHeader>

      <div className="scroll-shadow h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="space-y-6 p-4 pb-32">
          <div className="space-y-6">
            <Header
              title="Photos"
              description="View the photos of the listing"
              Icon={ImagesIcon}
              headingLevel={4}
            />
            <VerseCarousel photos={photos} />
          </div>

          <Separator />

          <div className="space-y-6">
            <Header
              title="Description"
              description="silly ahh description for silly ahh listing"
              Icon={FileTextIcon}
              headingLevel={4}
            />
            <p className="text-muted-foreground text-lg">
              {listing.description}
            </p>
          </div>

          <Separator />

          <div className="space-y-6">
            <Header
              title="Related Products"
              description="View the related products of the listing"
              Icon={PackageIcon}
              headingLevel={4}
            />

            <div className="space-y-3">
              {listing.products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductCard({
  product,
}: {
  product: Exclude<
    RouterOutputs["listing"]["findFullById"]["products"],
    undefined
  >[number];
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-1">
      <div className="size-12 shrink-0 overflow-hidden rounded-md border">
        <Image
          src={product.brand.logo.url}
          alt={product.brand.name}
          width={48}
          height={48}
          className="size-full object-cover"
        />
      </div>
      <div className="flex-1 rounded-md">
        <Link
          href={`/admin/products/${product.id}`}
          className="group flex cursor-pointer flex-col"
        >
          <p className="group-hover:text-primary-foreground text-muted-foreground text-sm transition-colors">
            {product.brand.name}
          </p>
          <p className="group-hover:text-primary-foreground/80 text-sm font-medium transition-colors">
            {product.title}
          </p>
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <PencilIcon />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/products/${product.id}`}>
            <EyeIcon />
          </Link>
        </Button>

        <DeleteProductDialog
          id={product.id}
          showText={false}
          variant="destructiveGhost"
        />
      </div>
    </div>
  );
}

function ListingDrawerSkeleton() {
  return (
    <>
      <DrawerHeader>
        <DrawerTitle></DrawerTitle>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </DrawerHeader>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-6 p-4 pb-32">
          <div className="space-y-6">
            {/* Photos Section */}
            <div className="flex items-center gap-3">
              <Skeleton className="size-12" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-96 w-full rounded-lg" />

              <div className="flex gap-2">
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {/* Description Section */}
            <div className="flex items-center gap-3">
              <Skeleton className="size-12" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-3/5" />
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {/* Related Products Section */}
            <div className="flex items-center gap-3">
              <Skeleton className="size-12" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-1">
      <Skeleton className="size-12 shrink-0 rounded-md" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="size-10" />
        <Skeleton className="size-10" />
        <Skeleton className="size-10" />
      </div>
    </div>
  );
}
