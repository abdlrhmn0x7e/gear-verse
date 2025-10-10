"use client";

import { type UniqueIdentifier } from "@dnd-kit/core";
import { IconShoppingBagX } from "@tabler/icons-react";
import { GripIcon } from "lucide-react";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";
import { DragableItem } from "../../_components/dragable-context";
import { useCategoryStore } from "../_store/provider";

type CategoryProductListItem =
  RouterOutputs["admin"]["products"]["queries"]["getPage"]["data"][number];

export function CategoryProductList({
  activeId,
  products,
  isLoadingProducts,
}: {
  activeId: UniqueIdentifier | null;
  products: CategoryProductListItem[] | undefined;
  isLoadingProducts: boolean;
}) {
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);

  if (!selectedCategory) {
    return (
      <div className="flex size-full items-center justify-center">
        <ProductsEmptyState />
      </div>
    );
  }

  if (isLoadingProducts) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <ProductsEmptyState />;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
      {products.map((product) => (
        <DragableItem
          id={`product:${product.id}`}
          key={`product-${product.id}`}
          className={cn(
            "bg-secondary border-accent flex gap-3 rounded-lg border px-3 py-1 transition select-none",
            activeId === `product:${product.id}` &&
              "ring-primary/40 scale-[0.98] opacity-40 ring-2",
          )}
          withHandle
        >
          <ProductListItem product={product} />
        </DragableItem>
      ))}
    </div>
  );
}

function ProductsEmptyState() {
  return (
    <div className="flex size-full items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconShoppingBagX />
          </EmptyMedia>
          <EmptyTitle>No products in this category</EmptyTitle>
          <EmptyDescription>
            Try another category or create a new product.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

type ProductListItem =
  RouterOutputs["admin"]["products"]["queries"]["getPage"]["data"][number];

export function ProductListItem({
  product,
  className,
}: {
  product: ProductListItem | undefined;
  className?: string;
}) {
  if (!product) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ImageWithFallback
        key={`product-thumbnail-${product.id}`}
        src={product.thumbnail.url}
        alt={product.title}
        width={128}
        height={128}
        className="size-16"
      />

      <div className="flex-1 space-y-1">
        <Heading level={5} className="font-medium">
          {product.title}
        </Heading>

        <div className="flex items-center gap-2">
          <ImageWithFallback
            src={product.brand.logo?.url ?? ""}
            alt={product.brand.name ?? "unknown brand"}
            className="size-4 rounded-full"
            width={16}
            height={16}
          />

          <span className="lg:text-md text-xs">{product.brand.name}</span>
        </div>
      </div>
    </div>
  );
}

function ProductListItemSkeleton() {
  return (
    <div className="bg-secondary border-accent flex cursor-grab gap-3 rounded-lg border px-3 py-1 select-none">
      <div className="flex items-center gap-3">
        <GripIcon className="size-4" />

        <Skeleton className="size-16" />
      </div>

      <div className="mt-1 flex-1 space-y-1">
        <Skeleton className="h-6 w-2/3" />

        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-full" />

          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
