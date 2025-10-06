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
import { Product } from "~/app/(public)/products/[slug]/_components/product";
import { api } from "~/trpc/react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ProductDescription } from "~/components/product-description";
import { Heading } from "~/components/heading";
import { Button } from "~/components/ui/button";
import { PencilIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "~/components/ui/skeleton";
import { useRef } from "react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { IconShoppingBagPlus, IconShoppingBagX } from "@tabler/icons-react";

export function ProductDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useProductSearchParams();

  function handleOpenChange(open: boolean) {
    if (open) {
      return;
    }
    void setParams((prev) => ({ ...prev, slug: null }));
  }

  return (
    <Drawer
      open={!!params.slug}
      onOpenChange={handleOpenChange}
      direction={isMobile ? "bottom" : "right"}
      handleOnly={!isMobile}
    >
      <DrawerContent className="pb-24 data-[vaul-drawer-direction=right]:sm:max-w-2xl">
        <ProductDrawerContent />
      </DrawerContent>
    </Drawer>
  );
}

function ProductDrawerContent() {
  const [params, setParams] = useProductSearchParams();
  const slugRef = useRef(params.slug); // hold the slug in ref until the drawer closes

  const {
    data: product,
    isPending,
    isError,
  } = api.public.products.queries.findBySlug.useQuery(
    {
      slug: slugRef.current ?? "",
    },
    {
      enabled: !!slugRef.current,
    },
  );

  if (isPending) {
    return (
      <>
        <DrawerHeader className="items-center justify-between gap-2 lg:flex-row">
          <div className="space-y-1">
            <DrawerTitle>Product Details</DrawerTitle>
            <DrawerDescription>
              View and manage detailed information about this product.
            </DrawerDescription>
          </div>

          <div>
            <Button variant="outline" asChild>
              <Link href="#">
                <PencilIcon />
                Edit
              </Link>
            </Button>
          </div>
        </DrawerHeader>

        <div className="space-y-4 p-4">
          <Skeleton className="h-[50svh]" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-24 w-24" />
            <Skeleton className="h-24 w-24" />
            <Skeleton className="h-24 w-24" />
            <Skeleton className="h-24 w-24" />
          </div>

          <div className="flex items-start justify-between gap-12">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />

              <Skeleton className="h-4 w-2/3" />
            </div>

            <Skeleton className="h-9 w-24 rounded-full" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <DrawerHeader>
          <DrawerTitle>Product Details</DrawerTitle>
          <DrawerDescription>
            View and manage detailed information about this product.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex h-full items-center justify-center p-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconShoppingBagX />
              </EmptyMedia>
              <EmptyTitle>An Error Occurred</EmptyTitle>
              <EmptyDescription>
                An error occurred while fetching the product details. Please try
                again later.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button
                  onClick={() => setParams((prev) => ({ ...prev, slug: null }))}
                >
                  <XIcon />
                  Close Drawer
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <DrawerHeader>
          <DrawerTitle>Product Details</DrawerTitle>
          <DrawerDescription>
            View and manage detailed information about this product.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex h-full items-center justify-center p-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconShoppingBagX />
              </EmptyMedia>
              <EmptyTitle>Product Not Found</EmptyTitle>
              <EmptyDescription>
                The product you are looking for does not exist.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/admin/products/new">
                    <IconShoppingBagPlus />
                    Create A New Product
                  </Link>
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </div>
      </>
    );
  }

  return (
    <>
      <DrawerHeader className="items-center justify-between gap-2 lg:flex-row">
        <div className="space-y-1">
          <DrawerTitle>Product Details</DrawerTitle>
          <DrawerDescription>
            View and manage detailed information about this product.
          </DrawerDescription>
        </div>

        <div>
          <Button variant="outline" asChild>
            <Link href={`/admin/products/${product.id}/edit`}>
              <PencilIcon />
              Edit
            </Link>
          </Button>
        </div>
      </DrawerHeader>

      <ScrollArea className="h-full">
        <Product
          product={product}
          className="grid-cols-1 p-0 lg:grid-cols-1 [&>div:first-child]:relative [&>div:first-child]:top-6"
          hideActions
        >
          <div>
            <Heading level={2}>Description</Heading>

            <ProductDescription
              description={product.description}
              className="m-0"
            />
          </div>
        </Product>
      </ScrollArea>
    </>
  );
}
