"use client";

import { type UniqueIdentifier } from "@dnd-kit/core";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { IconShoppingBagX } from "@tabler/icons-react";
import { GripIcon } from "lucide-react";
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
import { type RouterOutput } from "~/trpc/client";
import {
  DragableItem,
  DragableSortableContext,
} from "~/app/admin/_components/dragable-context";
import { useCategoryStore } from "../_store/provider";

type CategoryProductListItem =
  RouterOutput["admin"]["products"]["queries"]["getByCategory"][number];

export function CategoryProductList({
  activeId,
  products,
  isLoadingProducts,
}: {
  activeId: UniqueIdentifier | null;
  products: CategoryProductListItem[] | undefined;
  isLoadingProducts: boolean;
}) {
  const selectedCategoryId = useCategoryStore(
    (state) => state.selectedCategoryId,
  );

  if (selectedCategoryId === null) {
    return (
      <div className="flex size-full items-center justify-center">
        <ProductsEmptyState />
      </div>
    );
  }

  if (isLoadingProducts) {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <ProductsEmptyState />;
  }

  return (
    <DragableSortableContext
      items={products.map((product) => `product:${product.id}`)}
      strategy={rectSortingStrategy}
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {products.map((product, index) => (
          <DragableItem
            id={`product:${product.id}`}
            key={`product-${product.id}`}
            className={cn(
              "bg-card text-card-foreground [&>button]:text-muted-foreground relative flex h-full items-center gap-3 rounded-2xl py-2 pr-3 pl-3 transition-[opacity,box-shadow]",
              activeId === `product:${product.id}` &&
                "ring-primary/40 opacity-40 ring-2",
            )}
            withHandle
          >
            {/* the grid wraps into rows, so the number says where the product sits in the page's order */}
            <span className="text-muted-foreground min-w-4 text-center text-xs tabular-nums">
              {index + 1}
            </span>
            <ProductListItem product={product} />
          </DragableItem>
        ))}
      </div>
    </DragableSortableContext>
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
  RouterOutput["admin"]["products"]["queries"]["getByCategory"][number];

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
    <div
      className={cn("flex h-full min-w-0 flex-1 items-center gap-3", className)}
    >
      <ImageWithFallback
        key={`product-thumbnail-${product.id}`}
        src={product.thumbnail.url}
        alt={product.title}
        width={112}
        height={112}
        className="text-muted-foreground size-14 shrink-0 rounded-xl [&>svg]:size-1/2"
      />

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium">{product.title}</p>

        <div className="text-muted-foreground flex items-center gap-1.5">
          <ImageWithFallback
            src={product.brand.logo?.url ?? ""}
            alt={product.brand.name ?? "unknown brand"}
            className="size-4 rounded-full"
            width={16}
            height={16}
          />

          <span className="truncate text-xs">{product.brand.name}</span>
        </div>
      </div>
    </div>
  );
}

function ProductListItemSkeleton() {
  return (
    <div className="bg-card text-card-foreground flex h-[4.5rem] items-center gap-3 rounded-2xl px-3 py-2">
      <div className="flex items-center gap-3">
        <GripIcon className="text-muted-foreground size-4" />

        <Skeleton className="size-14 rounded-xl" />
      </div>

      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/3" />

        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-full" />

          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
