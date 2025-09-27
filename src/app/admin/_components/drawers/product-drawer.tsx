"use client";

// React & Core
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";

// Next.js
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
import { ProductDescription } from "../../../../components/product-description";
import { DeleteProductDialog } from "../dialogs/delete-product";
import {
  VerseCarousel,
  VerseCarouselSkeleton,
} from "~/components/verse-carousel";

// Hooks
import { useIsMobile } from "~/hooks/use-mobile";
import { useProductSearchParams } from "~/app/admin/_hooks/use-product-search-params";

// API & Types
import { api } from "~/trpc/react";

// Icons
import {
  AlertTriangleIcon,
  EyeIcon,
  FileTextIcon,
  ImagesIcon,
  InfoIcon,
  PencilIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { IconShoppingBagX } from "@tabler/icons-react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { VariantButton } from "~/components/variant-button";
import { cn } from "~/lib/utils";

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
  const isMobile = useIsMobile();
  const [params, setParams] = useProductSearchParams();

  const paramsProductIdRef = useRef<number>(params.productId);
  const {
    data: product,
    isPending: productPending,
    isError: productError,
  } = api.admin.products.findById.useQuery(
    {
      id: paramsProductIdRef.current ?? 0,
    },
    {
      enabled: !!paramsProductIdRef.current,
    },
  );

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const selectedVariant = useMemo(() => {
    return product?.variants.find(
      (variant) => variant.id === selectedVariantId,
    );
  }, [product, selectedVariantId]);

  // on product change, set the selected variant to the first variant
  useEffect(() => {
    setSelectedVariantId(product?.variants[0]?.id ?? null);
  }, [product]);

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
            <ImageWithFallback
              src={product.brand?.logo?.url}
              alt={product.brand?.name}
              className="size-12 rounded-md"
              width={128}
              height={128}
            />
            <div>
              <DrawerTitle>{product.name}</DrawerTitle>
              <DrawerDescription className="hidden sm:block">
                Created At {format(product.createdAt, "dd MMM, yyyy HH:mm a")}
              </DrawerDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <PencilIcon />
                {isMobile && "Edit product"}
              </Link>
            </Button>

            <DeleteProductDialog
              id={product.id}
              onDeleteSuccess={() => {
                void setParams((prev) => ({ ...prev, productId: null }));
              }}
              variant="destructiveGhost"
              showText={isMobile}
            />
          </div>
        </div>
      </DrawerHeader>

      <div className="scroll-shadow h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="space-y-6 p-4 pb-32">
          <div className="space-y-6">
            <Header
              title="Summary"
              description="View the photos of the product"
              Icon={ImagesIcon}
              headingLevel={4}
              className="flex-row text-left"
            />

            <ImageWithFallback
              src={product.thumbnail?.url}
              alt={product.name}
              className="size-full"
              width={512}
              height={512}
            />

            <p className="text-muted-foreground">{product.summary}</p>
          </div>

          <Separator />

          <div className="space-y-6">
            <Header
              title="Variants"
              description="View the photos of the product"
              Icon={ImagesIcon}
              headingLevel={4}
              className="flex-row text-left"
            />
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <VariantButton
                  key={variant.id}
                  variant={variant}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={cn(
                    selectedVariantId === variant.id && "ring-primary ring-2",
                  )}
                />
              ))}
            </div>
            <VerseCarousel photos={selectedVariant?.images ?? []} />
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
                    <span>{product.name} Description</span>
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
