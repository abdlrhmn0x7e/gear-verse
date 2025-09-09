"use client";

// External Libraries
import { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Icon Libraries
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
import { IconShoppingBagX } from "@tabler/icons-react";

// App Components
import Header, { HeaderSkeleton } from "~/app/admin/_components/header";
import { useListingSearchParams } from "~/app/admin/_hooks/use-listing-search-params";
import { DeleteProductDialog } from "~/app/admin/_components/dialogs/delete-product-dialog";
import { DeleteListingDialog } from "../dialogs/delete-listing-dialog";

// UI Components
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  VerseCarousel,
  VerseCarouselSkeleton,
} from "~/components/verse-carousel";

// Hooks & API
import { useIsMobile } from "~/hooks/use-mobile";
import { api, type RouterOutputs } from "~/trpc/react";

export function ListingDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useListingSearchParams();

  function handleOpenChange(open: boolean) {
    if (!open) {
      void setParams((prev) => ({ ...prev, listingId: null }));
      return;
    }

    void setParams((prev) => ({
      ...prev,
      listingId: null,
    }));
  }

  return (
    <Drawer
      open={!!params.listingId}
      onOpenChange={handleOpenChange}
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

  if (listingPending) {
    return <ListingDrawerSkeleton />;
  }

  if (!listing) {
    return (
      <>
        <DrawerHeader>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <IconShoppingBagX className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>Listing not found</DrawerTitle>
              <DrawerDescription>Listing not found</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex h-full flex-col items-center justify-center gap-3 py-32">
          <InfoIcon className="text-info size-24" />
          <div className="text-center">
            <p className="text-lg font-medium">Listing not found</p>
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
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <IconShoppingBagX className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>Listing Error</DrawerTitle>
              <DrawerDescription>
                An error occurred while loading the listing
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex h-full flex-col items-center justify-center gap-3 py-32">
          <AlertTriangleIcon className="text-destructive size-24" />
          <div className="text-center">
            <p className="text-destructive text-lg font-medium">
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
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <ShoppingBagIcon className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>{listing.title}</DrawerTitle>
              <DrawerDescription className="hidden sm:block">
                {listing.summary}
              </DrawerDescription>
            </div>
          </div>
          <div className="flex gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full flex-1 justify-start sm:w-auto"
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
              className="flex-row text-left"
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
              className="flex-row text-left"
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
              className="flex-row text-left"
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
          href={`/admin/products?productId=${product.id}`}
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
          <Link href={`/admin/products?productId=${product.id}`}>
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
        <DrawerTitle className="sr-only hidden">Loading</DrawerTitle>
        <DrawerDescription className="sr-only hidden">
          Listing is Loading
        </DrawerDescription>

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <ShoppingBagIcon className="mt-1.5 size-6 shrink-0" />
            <div>
              <Skeleton className="h-7 w-48" /> {/* Title */}
              <Skeleton className="mt-1 h-4 w-64 sm:block" />{" "}
              {/* Description */}
            </div>
          </div>
          <div className="flex gap-2 sm:flex-row">
            <Skeleton className="h-10 w-28" /> {/* Edit button */}
            <Skeleton className="h-10 w-32" /> {/* Delete button */}
          </div>
        </div>
      </DrawerHeader>

      <div className="scroll-shadow h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="space-y-6 p-4 pb-32">
          <div className="space-y-6">
            {/* Photos Section */}
            <HeaderSkeleton Icon={ImagesIcon} />

            <VerseCarouselSkeleton />
          </div>

          <Separator />

          <div className="space-y-6">
            {/* Description Section */}
            <HeaderSkeleton Icon={FileTextIcon} />
            <Skeleton className="h-6 w-full" /> {/* Single description line */}
          </div>

          <Separator />

          <div className="space-y-6">
            {/* Related Products Section */}
            <HeaderSkeleton Icon={PackageIcon} />

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
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
