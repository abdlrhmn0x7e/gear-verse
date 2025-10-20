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
import { Product, ProductSkeleton } from "~/components/product";
import { api } from "~/trpc/react";
import { ProductDescription } from "~/components/product-description";
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
import { DeleteProductDialog } from "../dialogs/delete-product";

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
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl">
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

        <ProductSkeleton className="grid-cols-1 gap-12 p-4 pb-24 md:px-2 lg:grid-cols-1 lg:p-4 lg:px-2 [&>div:first-child]:relative [&>div:first-child]:top-6" />
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

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/products/${product.id}`}>
              <PencilIcon />
              Edit
            </Link>
          </Button>
          <DeleteProductDialog id={product.id} />
        </div>
      </DrawerHeader>

      <div className="mr-2 overflow-y-auto">
        <Product
          product={product}
          className="grid-cols-1 gap-12 p-4 pb-24 lg:grid-cols-1 lg:p-4 [&>div:first-child]:relative [&>div:first-child]:top-6"
          hideActions
        >
          <ProductDescription
            description={product.description}
            className="m-0"
          />
        </Product>
      </div>
    </>
  );
}
