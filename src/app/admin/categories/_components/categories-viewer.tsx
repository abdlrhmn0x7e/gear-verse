"use client";

import {
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FolderIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "~/components/ui/toast";
import {
  DragableContext,
  DragableOverlay,
  Droppable,
} from "~/app/admin/_components/dragable-context";
import { SearchInput } from "~/app/admin/_components/inputs/search-input";
import { useCategoryStore } from "../_store/provider";
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
  skipToken,
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
 * The category tree in a full-height pane beside the selected category's details.
 * Dragging a category onto another nests it there (or onto "Move to the root"
 * to lift it out); dragging a product onto a category moves the product, and
 * onto another product sets the order the category's page shows.
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
  const getByCategory = trpc.admin.products.queries.getByCategory;
  // in the order the category's page shows them by default
  const { data: products, isPending: isLoadingProducts } = useQuery(
    getByCategory.queryOptions(
      selectedId === undefined ? skipToken : { categoryId: selectedId },
    ),
  );
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

  const { mutate: reorderCategory } = useMutation(
    trpc.admin.products.mutations.reorderCategory.mutationOptions({
      // one at a time, so a quick second drag can't land before the first
      scope: { id: "category-order" },
      onMutate: async ({ categoryId, ids }) => {
        const query = getByCategory.queryOptions({ categoryId });
        await queryClient.cancelQueries(query);
        const previous = queryClient.getQueryData(query.queryKey);
        queryClient.setQueryData(
          query.queryKey,
          (rows) =>
            rows && ids.flatMap((id) => rows.find((r) => r.id === id) ?? []),
        );
        return { previous };
      },
      onError: (_error, { categoryId }, context) => {
        queryClient.setQueryData(
          getByCategory.queryKey({ categoryId }),
          context?.previous,
        );
        toast.error("Couldn't save the new order");
      },
      onSettled: (_data, _error, { categoryId }) =>
        queryClient.invalidateQueries(
          getByCategory.queryFilter({ categoryId }),
        ),
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

  const isDraggingCategory = activeId?.toString().startsWith("category:");

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

    // Product -> Product: put the dragged product where the target was
    if (
      activeInfo.type === "product" &&
      overInfo.type === "product" &&
      products &&
      selectedId !== undefined
    ) {
      const ids = products.map((product) => product.id);
      const from = ids.indexOf(activeInfo.id);
      const to = ids.indexOf(overInfo.id);
      if (from !== -1 && to !== -1) {
        reorderCategory({
          categoryId: selectedId,
          ids: arrayMove(ids, from, to),
        });
      }
      setActiveId(null);
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
    <DragableContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex min-h-0 flex-1 flex-col max-md:overflow-y-auto md:flex-row">
        <aside
          aria-label="Categories"
          className="relative flex shrink-0 flex-col max-md:border-b md:w-72 md:border-r"
        >
          <div className="admin-controls flex flex-col gap-3 px-4 pt-4 pb-3">
            <h2 className="text-sm font-medium">
              Categories
              <span className="text-muted-foreground ml-1.5 font-normal tabular-nums">
                {categories ? countCategories(categories) : null}
              </span>
            </h2>

            <SearchInput
              placeholder="Search categories"
              aria-label="Search categories"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto px-2 pb-4">
            {isPendingCategories ? (
              <CategoryTreeSkeleton />
            ) : visibleCategories.length === 0 ? (
              <CategoryTreeEmptyState searched={!!search.trim()} />
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

          {/* Laid over the bottom of the pane, so showing it moves no rows. */}
          <Droppable
            id="category:0"
            disabled={!isDraggingCategory}
            className={cn(
              "bg-background text-muted-foreground absolute inset-x-3 bottom-3 flex h-12 items-center justify-center rounded-2xl border border-dashed text-sm transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
              isDraggingCategory
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
            classNameWhenOver="bg-accent text-foreground border-primary/40"
          >
            Move to the root
          </Droppable>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-6 md:overflow-y-auto md:px-6">
          {isPendingCategories ? (
            <CategoryDetailsSkeleton />
          ) : selectedCategory ? (
            <CategoryDetails
              key={selectedCategory.id}
              category={selectedCategory}
              parent={parentCategory}
              products={products}
              isLoadingProducts={isLoadingProducts}
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

      {/* A copy of the dragged card or row, lifted slightly; the scale pivots on the handle so it stays under the pointer. */}
      <DragableOverlay
        className={cn(
          "bg-card [&>button]:text-muted-foreground flex h-full origin-left scale-95 gap-3 rounded-2xl px-3 py-2 shadow-xl transition-[scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] select-none",
          isDraggingCategory &&
            "bg-accent h-8 origin-right gap-1 rounded-lg py-0 pr-8 pl-0.5 text-sm [&>button]:order-last",
        )}
        isDropping={!activeId}
        withHandle
      >
        {typeof activeId === "string" && activeId.startsWith("product:") && (
          <ProductListItem product={activeProduct} />
        )}

        {typeof activeId === "string" && activeId.startsWith("category:") && (
          <div className="flex items-center gap-2 pl-7 font-medium">
            {activeCategory ? (
              <CategoryIcon
                icon={activeCategory.icon}
                className="size-4 shrink-0"
              />
            ) : (
              <FolderIcon className="size-4 shrink-0" />
            )}
            <span className="truncate">
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
