"use client";

// React & Core
import { useRef } from "react";
import { format } from "date-fns";

// Next.js
import Image from "next/image";
import Link from "next/link";

// UI Components
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

// Custom Components
import Header, { HeaderSkeleton } from "~/components/header";
import { ProductDescription } from "../product-description";
import { DeleteProductDialog } from "../dialogs/delete-product-dialog";
import {
  VerseCarousel,
  VerseCarouselSkeleton,
} from "~/components/verse-carousel";

// Hooks
import { useIsMobile } from "~/hooks/use-mobile";
import { useProductSearchParams } from "~/app/admin/_hooks/use-product-search-params";

// API & Types
import { api, type RouterOutputs } from "~/trpc/react";

// Icons
import {
  AlertTriangleIcon,
  EyeIcon,
  FileTextIcon,
  ImageOffIcon,
  ImagesIcon,
  InfoIcon,
  PencilIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { IconShoppingBagX } from "@tabler/icons-react";

export function ProductDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useProductSearchParams();

  function handleOpenChange(open: boolean) {
    if (open) {
      return;
    }
    void setParams((prev) => ({ ...prev, productId: null }));
  }

  return (
    <Drawer
      open={!!params.productId}
      onOpenChange={handleOpenChange}
      direction={isMobile ? "bottom" : "right"}
      handleOnly={!isMobile}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <ProductDrawerContent />
      </DrawerContent>
    </Drawer>
  );
}

function ProductDrawerContent() {
  const [params, setParams] = useProductSearchParams();

  const paramsProductIdRef = useRef<number>(params.productId);
  const {
    data: product,
    isPending: productPending,
    isError: productError,
  } = api.products.findById.useQuery(
    {
      id: paramsProductIdRef.current ?? 0,
    },
    {
      enabled: !!paramsProductIdRef.current,
    },
  );

  if (productPending) {
    return <ProductDrawerSkeleton />;
  }

  if (!product) {
    return (
      <>
        <DrawerHeader>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <IconShoppingBagX className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>Product not found</DrawerTitle>
              <DrawerDescription>Product not found</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex h-full flex-col items-center justify-center gap-3 py-32">
          <InfoIcon className="text-info size-24" />
          <div className="text-center">
            <p className="text-lg font-medium">Product not found</p>
            <p className="text-muted-foreground text-sm">
              (this time it&apos;s your fault daddy)
            </p>
          </div>
        </div>
      </>
    );
  }

  if (productError) {
    return (
      <>
        <DrawerHeader>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <IconShoppingBagX className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>Product Error</DrawerTitle>
              <DrawerDescription>
                An error occurred while loading the product
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex h-full flex-col items-center justify-center gap-3 py-32">
          <AlertTriangleIcon className="text-destructive size-24" />
          <div className="text-center">
            <p className="text-destructive text-lg font-medium">
              An error occurred while loading the product
            </p>
            <p className="text-muted-foreground text-sm">
              (sorry daddy my bad)
            </p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <DrawerHeader>
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <ShoppingBagIcon className="mt-1.5 size-6 shrink-0" />
            <div>
              <DrawerTitle>{product.title}</DrawerTitle>
              <DrawerDescription className="hidden sm:block">
                Created At {format(product.createdAt, "dd MMM, yyyy HH:mm a")}
              </DrawerDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <PencilIcon />
                Edit Product
              </Link>
            </Button>

            <DeleteProductDialog
              id={product.id}
              onDeleteSuccess={() => {
                void setParams((prev) => ({ ...prev, productId: null }));
              }}
            />
          </div>
        </div>
      </DrawerHeader>

      <div className="scroll-shadow h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="space-y-6 p-4 pb-32">
          <div className="space-y-6">
            <Header
              title="Photos"
              description="View the photos of the product"
              Icon={ImagesIcon}
              headingLevel={4}
              className="flex-row text-left"
            />
            <VerseCarousel photos={product.images} />
          </div>

          <Separator />

          <div className="space-y-6">
            <Header
              title="Related Listings"
              description="View the listings that contain this product"
              Icon={ShoppingBagIcon}
              headingLevel={4}
              className="flex-row text-left"
            />
            <div className="space-y-2">
              {product.listings.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-sm">
                  <IconShoppingBagX className="size-12" />
                  <span>No listings found</span>
                </div>
              ) : (
                product.listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <Header
              title="Description"
              description="View the description of the product"
              Icon={FileTextIcon}
              headingLevel={4}
              className="flex-row text-left"
            />

            <DrawerDialog>
              <DrawerDialogTrigger asChild>
                <Card className="ring-primary cursor-pointer transition-all hover:opacity-80 hover:ring-2">
                  <CardContent className="relative h-[400px] overflow-hidden">
                    <ProductDescription description={product.description} />

                    <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t" />
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button variant="ghost">
                      <EyeIcon />
                      View Full Description
                    </Button>
                  </CardFooter>
                </Card>
              </DrawerDialogTrigger>

              <DrawerDialogContent className="sm:max-w-2xl">
                <DrawerDialogHeader>
                  <DrawerDialogTitle className="flex items-center gap-2">
                    <FileTextIcon className="size-6" />
                    <span>{product.title} Description</span>
                  </DrawerDialogTitle>
                  <DrawerDialogDescription></DrawerDialogDescription>
                </DrawerDialogHeader>

                <div className="scroll-shadow max-h-[calc(100svh-24rem)] overflow-y-auto px-4 pb-32 sm:max-h-[calc(100vh-10rem)]">
                  <ProductDescription description={product.description} />
                </div>
              </DrawerDialogContent>
            </DrawerDialog>
          </div>
        </div>
      </div>
    </>
  );
}

function ListingCard({
  listing,
}: {
  listing: RouterOutputs["products"]["findById"]["listings"][number];
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-1">
      {listing.thumbnail ? (
        <div className="size-12 shrink-0 overflow-hidden rounded-md border">
          <Image
            src={listing.thumbnail.url}
            alt={listing.title}
            width={48}
            height={48}
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-md border">
          <ImageOffIcon />
        </div>
      )}
      <div className="flex-1 rounded-md">
        <Link
          href={`/admin/listings?listingId=${listing.id}`}
          className="group flex cursor-pointer flex-col"
        >
          <p className="group-hover:text-primary transition-colors">
            {listing.title}
          </p>
          <p className="group-hover:text-primary text-muted-foreground line-clamp-1 text-sm font-medium transition-colors">
            {listing.summary}
          </p>
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/listings?listingId=${listing.id}&type=edit`}>
            <PencilIcon />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/listings?listingId=${listing.id}`}>
            <EyeIcon />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ProductDrawerSkeleton() {
  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="sr-only hidden">Loading</DrawerTitle>
        <DrawerDescription className="sr-only hidden">
          Product is Loading
        </DrawerDescription>

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <ShoppingBagIcon className="mt-1.5 size-6 shrink-0" />
            <div>
              <Skeleton className="h-7 w-48" /> {/* Title */}
              <Skeleton className="mt-1 h-4 w-64 sm:block" />{" "}
              {/* Creation date */}
            </div>
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
            {/* Related Listings Section */}
            <HeaderSkeleton Icon={ShoppingBagIcon} />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <ListingCardSkeleton key={index} />
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {/* Description Section */}
            <HeaderSkeleton Icon={FileTextIcon} />
            <Card className="ring-primary cursor-pointer transition-all hover:opacity-80 hover:ring-2">
              <CardContent className="relative h-[400px] overflow-hidden">
                <div className="space-y-3 p-6">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
                <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t" />
              </CardContent>
              <CardFooter className="justify-center">
                <Skeleton className="h-10 w-48" />{" "}
                {/* View Full Description button */}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function ListingCardSkeleton() {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-1">
      <Skeleton className="size-12 shrink-0 rounded-md" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="size-10" />
        <Skeleton className="size-10" />
      </div>
    </div>
  );
}
