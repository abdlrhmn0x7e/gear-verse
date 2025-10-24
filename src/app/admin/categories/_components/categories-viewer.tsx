"use client";

import {
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  ChevronRight,
  FolderIcon,
  FolderOpenIcon,
  PlusCircleIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Heading } from "~/components/heading";
import { LoadMore } from "~/components/load-more";
import { Button } from "~/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
  DragableContext,
  DragableOverlay,
  Droppable,
} from "~/app/admin/_components/dragable-context";
import { useCategoryStore } from "../_store/provider";
import { AddCategory } from "./add-category";
import {
  CategoryTree,
  CategoryTreeEmptyState,
  CategoryTreeSkeleton,
} from "./category-tree";
import { CategoryProductList, ProductListItem } from "./products-grid";
import { iconsMap } from "~/lib/icons-map";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useInfiniteQuery } from "node_modules/@tanstack/react-query/build/modern/useInfiniteQuery";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function CategoriesViewer() {
  const trpc = useTRPC();
  const { data: categories, isPending: isPendingCategories } = useQuery(
    trpc.admin.categories.queries.findAll.queryOptions(),
  );
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const parentCategory = useCategoryStore((state) => state.parentCategory);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const queryParams = useMemo(() => {
    return {
      filters: {
        categories: selectedCategory?.id ? [selectedCategory.id] : undefined,
      },
      pageSize: 10,
    };
  }, [selectedCategory]);
  const {
    data,
    isPending: isLoadingProducts,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    trpc.admin.products.queries.getPage.infiniteQueryOptions(queryParams, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
  );

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.data);
  }, [data]);
  const activeProduct = useMemo(() => {
    if (!activeId || typeof activeId !== "string") return undefined;
    const [type, raw] = activeId.split(":");
    if (type !== "product") return undefined;
    const pid = Number(raw);
    if (isNaN(pid)) return undefined;
    return products?.find((p) => p.id === pid);
  }, [products, activeId]);

  const activeCategory = useMemo(() => {
    if (!activeId || typeof activeId !== "string") return undefined;

    const [type, raw] = activeId.split(":");
    if (type !== "category") return undefined;

    const cid = Number(raw);
    if (isNaN(cid)) return undefined;

    // recursively find the category by id
    const findById = (
      nodes: NonNullable<typeof categories>,
      id: number,
    ): (typeof nodes)[number] | undefined => {
      for (const node of nodes) {
        if (node.id === id) return node;

        const inChild = node.children ? findById(node.children, id) : undefined;

        if (inChild) return inChild;
      }
      return undefined;
    };

    return categories ? findById(categories, cid) : undefined;
  }, [categories, activeId]);

  const queryClient = useQueryClient();
  const { mutate: updateProductCategory } = useMutation(
    trpc.admin.products.mutations.editDeep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.products.queries.getPage.queryFilter(),
        );
      },

      // Optimistic updates
      onMutate: async (data) => {
        await queryClient.cancelQueries(
          trpc.admin.products.queries.getPage.queryFilter(),
        );
        const oldProducts = queryClient.getQueryData(
          trpc.admin.products.queries.getPage.queryKey(),
        );
        if (!oldProducts) return;

        queryClient.setQueryData(
          trpc.admin.products.queries.getPage.queryKey(),
          {
            ...oldProducts,
            data: oldProducts.data.filter((p) => p.id !== data.id),
          },
        );

        return { previousProducts: oldProducts };
      },

      onError: (_err, _newTodo, context) => {
        if (!context) return;
        queryClient.setQueryData(
          trpc.admin.products.queries.getPage.queryKey(),
          context.previousProducts,
        );
      },

      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.admin.products.queries.getPage.queryFilter(),
        );
      },
    }),
  );

  const { mutate: updateCategoryParent } = useMutation(
    trpc.admin.categories.mutations.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findAll.queryFilter(),
        );
      },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function parseDndId(id: UniqueIdentifier | undefined) {
    if (!id || typeof id !== "string") return null;
    const [type, raw] = id.split(":");
    const numeric = Number(raw);
    if (!type || isNaN(numeric)) return null;
    return { type, id: numeric } as const;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id === over?.id) {
      setActiveId(null);
      return;
    }

    const activeInfo = parseDndId(active.id as string);
    const overInfo = parseDndId(over?.id as string | undefined);

    if (!activeInfo || !overInfo) {
      setActiveId(null);
      return;
    }

    // Product -> Category: move product to target category
    if (activeInfo.type === "product" && overInfo.type === "category") {
      // if the target is the root, don't move the product
      if (overInfo.id === 0) {
        setActiveId(null);
        return;
      }

      updateProductCategory({
        id: activeInfo.id,
        data: { categoryId: overInfo.id },
      });
      setTimeout(() => setActiveId(null), 180);
      return;
    }

    // Category -> Category: make dragged category a child of the target
    if (activeInfo.type === "category" && overInfo.type === "category") {
      // if the target is the same as the source, don't move the category
      if (activeInfo.id === overInfo.id) {
        setTimeout(() => setActiveId(null), 180);
        return;
      }

      // if the target is the root, move the category to the root
      if (overInfo.id === 0) {
        updateCategoryParent({ id: activeInfo.id, parent_id: null });
      } else {
        updateCategoryParent({ id: activeInfo.id, parent_id: overInfo.id });
      }

      setTimeout(() => setActiveId(null), 180);
      return;
    }

    setActiveId(null);
  }

  return (
    <DragableContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Card className="size-full gap-1 p-2">
        <CardContent className="size-full p-0">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full overflow-hidden rounded-lg"
          >
            {/* Category Tree */}
            <ResizablePanel
              className="relative flex h-full flex-col gap-2 px-3 py-1"
              defaultSize={25}
              minSize={15}
            >
              <div className="h-fit space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Heading level={5} className="font-medium">
                    Categories (
                    {categories?.reduce(
                      (acc, curr) => acc + (curr.children?.length ?? 0),
                      categories?.length ?? 0,
                    )}
                    )
                  </Heading>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer rounded-full"
                    onClick={() => setShowAddCategory(true)}
                  >
                    <PlusCircleIcon />
                  </Button>
                </div>

                {isPendingCategories ? (
                  <CategoryTreeSkeleton />
                ) : categories?.length === 0 ? (
                  <CategoryTreeEmptyState />
                ) : (
                  categories?.map((category) => (
                    <CategoryTree
                      key={category.id}
                      categories={category}
                      isDragging={!!activeId}
                    />
                  ))
                )}

                {showAddCategory && (
                  <div className="mt-2 ml-2">
                    <AddCategory
                      parentCategoryId={null}
                      onSuccess={() => setShowAddCategory(false)}
                      cancel={() => setShowAddCategory(false)}
                    />
                  </div>
                )}
              </div>

              <Droppable
                id="category:0"
                className="flex flex-1 items-center justify-center rounded-lg opacity-0 transition-opacity"
                classNameWhenOver="bg-accent/40 border-2 border-dashed opacity-100"
              >
                <p>Move to the root</p>
              </Droppable>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-transparent" />

            <ResizablePanel defaultSize={75} className="size-full">
              <Card className="bg-background size-full gap-1 p-2">
                <CardHeader className="p-0">
                  <div className="bg-background flex w-full items-center justify-between gap-2 border-b p-4">
                    <Heading level={4} className="flex items-center gap-2">
                      <FolderOpenIcon />
                      {parentCategory?.name && (
                        <>
                          {parentCategory.name}
                          <ChevronRight />
                        </>
                      )}
                      {selectedCategory?.name ?? "No Category Selected"}{" "}
                    </Heading>

                    <p className="text-muted-foreground text-sm font-medium">
                      {products?.length ?? 0} Products
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="h-full overflow-y-auto p-4">
                    <CategoryProductList
                      activeId={activeId}
                      products={products}
                      isLoadingProducts={isLoadingProducts}
                    />

                    <LoadMore hasNextPage={hasNextPage} ref={ref} />
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>

      <DragableOverlay
        className={cn(
          "bg-secondary/95 border-accent/80 flex max-w-fit origin-top-left scale-70 gap-3 rounded-lg border px-3 py-1 shadow-xl shadow-black/10 backdrop-blur-sm transition-all select-none",
          activeId &&
            activeId.toString().startsWith("category:") &&
            "bg-sidebar border-sidebar-accent origin-bottom-right translate-x-full scale-90",
        )}
        isDropping={!activeId}
        withHandle
      >
        {typeof activeId === "string" && activeId.startsWith("product:") && (
          <ProductListItem product={activeProduct} />
        )}

        {typeof activeId === "string" && activeId.startsWith("category:") && (
          <div className="flex w-32 items-center gap-3">
            {(() => {
              const Icon = activeCategory
                ? (iconsMap.get(activeCategory.icon) ?? FolderIcon)
                : FolderIcon;
              return <Icon />;
            })()}
            <span className="font-medium">
              {activeCategory?.name ?? "Category"}
            </span>
          </div>
        )}
      </DragableOverlay>
    </DragableContext>
  );
}
