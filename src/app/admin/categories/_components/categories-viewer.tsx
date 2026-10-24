"use client";

import {
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { FolderIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "~/components/ui/toast";
import { Button } from "~/components/ui/button";
import {
  DragableContext,
  DragableOverlay,
  Droppable,
} from "~/app/admin/_components/dragable-context";
import { SearchInput } from "~/app/admin/_components/inputs/search-input";
import { useCategoryStore } from "../_store/provider";
import { AddCategory } from "./add-category";
import {
  CategoryIcon,
  CategoryTree,
  CategoryTreeEmptyState,
  CategoryTreeSkeleton,
  countCategories,
  filterCategories,
  findCategory,
  findParentCategory,
} from "./category-tree";
import { CategoryDetails } from "./category-details";
import { ProductListItem } from "./products-grid";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

/**
 * The category tree on a fixed rail beside the selected category's details.
 * Dragging a category onto another nests it there (or onto "Move to the root"
 * to lift it out); dragging a product onto a category moves the product.
 */
export function CategoriesViewer() {
  const trpc = useTRPC();
  const { data: categories, isPending: isPendingCategories } = useQuery(
    trpc.admin.categories.queries.findAll.queryOptions(),
  );
  const selectedCategoryId = useCategoryStore(
    (state) => state.selectedCategoryId,
  );
  const setSelectedCategoryId = useCategoryStore(
    (state) => state.setSelectedCategoryId,
  );

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [search, setSearch] = useState("");

  // Read from the latest tree, so an edit or a move shows straight away.
  const selectedCategory =
    categories && selectedCategoryId !== null
      ? findCategory(categories, selectedCategoryId)
      : undefined;
  const parentCategory =
    categories && selectedCategory
      ? findParentCategory(categories, selectedCategory.id)
      : undefined;

  // Open on the first category rather than an empty pane.
  const firstCategoryId = categories?.[0]?.id;
  useEffect(() => {
    if (!selectedCategory && firstCategoryId !== undefined) {
      setSelectedCategoryId(firstCategoryId);
    }
  }, [selectedCategory, firstCategoryId, setSelectedCategoryId]);

  const visibleCategories = useMemo(
    () => filterCategories(categories ?? [], search),
    [categories, search],
  );

  const selectedId = selectedCategory?.id;
  const queryParams = useMemo(() => {
    return {
      filters: {
        categories: selectedId ? [selectedId] : undefined,
      },
      pageSize: 10,
    };
  }, [selectedId]);
  const { data: pinned, isPending: isLoadingPinned } = useQuery(
    trpc.admin.products.queries.getPinned.queryOptions(
      { filters: queryParams.filters },
      { enabled: selectedId !== undefined },
    ),
  );
  const {
    data,
    isPending: isLoadingProducts,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    trpc.admin.products.queries.getPage.infiniteQueryOptions(queryParams, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: selectedId !== undefined,
    }),
  );

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  // getPage skips pinned products, so they lead the list as on the products page
  const products = useMemo(() => {
    if (!pinned || !data) return undefined;
    return [...pinned, ...data.pages.flatMap((page) => page.data)];
  }, [pinned, data]);
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

    return categories ? findCategory(categories, cid) : undefined;
  }, [categories, activeId]);

  const queryClient = useQueryClient();
  const { mutate: updateProductCategory } = useMutation(
    trpc.admin.products.mutations.editDeep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.products.queries.pathFilter(),
        );
      },
    }),
  );

  const { mutate: updateCategoryParent } = useMutation(
    trpc.admin.categories.mutations.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.admin.categories.pathFilter());
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't move the category");
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

    const activeInfo = parseDndId(active.id);
    const overInfo = parseDndId(over?.id);

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

      // nesting it under one of its own sub-categories would make a loop
      if (
        overInfo.id !== 0 &&
        activeCategory &&
        findCategory([activeCategory], overInfo.id)
      ) {
        toast.error(
          "A category can't move inside one of its own sub-categories.",
        );
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
      <div className="grid items-start gap-6 md:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        {/* The rail stays put while the details scroll, and scrolls on its own
            once the tree outgrows the page. */}
        <aside
          aria-label="Categories"
          className="bg-card flex flex-col gap-3 rounded-3xl p-3 md:sticky md:top-(--page-sticky-top) md:max-h-(--page-sticky-height)"
        >
          <div className="flex items-center justify-between gap-2 pl-2">
            <h2 className="text-sm font-medium">
              Categories
              <span className="text-muted-foreground ml-1.5 font-normal tabular-nums">
                {categories ? countCategories(categories) : null}
              </span>
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Add category"
              onClick={() => setShowAddCategory(true)}
            >
              <PlusIcon />
            </Button>
          </div>

          <SearchInput
            placeholder="Search categories"
            aria-label="Search categories"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {showAddCategory && (
            <div className="bg-background rounded-2xl p-2">
              <AddCategory
                parentCategoryId={null}
                onSuccess={() => setShowAddCategory(false)}
                cancel={() => setShowAddCategory(false)}
              />
            </div>
          )}

          <div className="-m-1 flex min-h-0 flex-1 flex-col gap-px overflow-y-auto p-1">
            {isPendingCategories ? (
              <CategoryTreeSkeleton />
            ) : visibleCategories.length === 0 ? (
              !showAddCategory && (
                <CategoryTreeEmptyState searched={!!search.trim()} />
              )
            ) : (
              // Searching unfolds every branch so the matches show.
              <div
                key={search.trim() ? "search" : "browse"}
                className="flex flex-col gap-px"
              >
                {visibleCategories.map((category) => (
                  <CategoryTree
                    key={category.id}
                    categories={category}
                    defaultOpen={!!search.trim()}
                  />
                ))}
              </div>
            )}
          </div>

          <Droppable
            id="category:0"
            className={cn(
              "text-muted-foreground flex h-12 shrink-0 items-center justify-center rounded-2xl border border-dashed text-sm transition-opacity",
              activeId?.toString().startsWith("category:")
                ? "opacity-100"
                : "pointer-events-none hidden",
            )}
            classNameWhenOver="bg-accent text-foreground border-primary/40"
          >
            Move to the root
          </Droppable>
        </aside>

        <div className="min-w-0">
          {isPendingCategories ? (
            <CategoryDetailsSkeleton />
          ) : selectedCategory ? (
            <CategoryDetails
              key={selectedCategory.id}
              category={selectedCategory}
              parent={parentCategory}
              products={products}
              isLoadingProducts={isLoadingProducts || isLoadingPinned}
              hasNextPage={hasNextPage}
              loadMoreRef={ref}
              activeId={activeId}
            />
          ) : (
            <Empty className="bg-card rounded-3xl py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderIcon />
                </EmptyMedia>
                <EmptyTitle>No category selected</EmptyTitle>
                <EmptyDescription>
                  Pick a category from the list, or add your first one.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>

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
            {activeCategory ? (
              <CategoryIcon icon={activeCategory.icon} />
            ) : (
              <FolderIcon />
            )}
            <span className="font-medium">
              {activeCategory?.name ?? "Category"}
            </span>
          </div>
        )}
      </DragableOverlay>
    </DragableContext>
  );
}

function CategoryDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-2xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
