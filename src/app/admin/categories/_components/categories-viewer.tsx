"use client";

import {
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { IconShoppingBagX } from "@tabler/icons-react";
import {
  ChevronRight,
  EllipsisVerticalIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  GripIcon,
  PencilIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Skeleton } from "~/components/ui/skeleton";
import { iconsMap } from "~/lib/icons-map";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  DragableContext,
  DragableItem,
  DragableOverlay,
  Droppable,
} from "../../_components/dragable-context";
import { useCategoryStore } from "../_store/provider";
import { AddCategory } from "./add-category";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Spinner } from "~/components/spinner";
import { createPortal } from "react-dom";

type CategoryTree =
  RouterOutputs["admin"]["categories"]["queries"]["findAll"][number];

export function CategoriesViewer() {
  const { data: categories } = api.admin.categories.queries.findAll.useQuery();
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const parentCategory = useCategoryStore((state) => state.parentCategory);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const queryParams = useMemo(() => {
    return {
      filters: {
        categories: selectedCategory?.id ? [selectedCategory.id] : undefined,
      },
      pageSize: 10,
    };
  }, [selectedCategory]);
  const { data: products } =
    api.admin.products.queries.getPage.useQuery(queryParams);
  const activeProduct = useMemo(() => {
    return products?.data.find((p) => p.id === activeId);
  }, [products, activeId]);

  const utils = api.useUtils();
  const { mutate: updateProductCategory } =
    api.admin.products.mutations.editDeep.useMutation({
      onSuccess: () => {
        void utils.admin.products.queries.getPage.invalidate();
      },

      onMutate: async (data) => {
        await utils.admin.products.queries.getPage.cancel();
        const oldProducts =
          utils.admin.products.queries.getPage.getData(queryParams);
        if (!oldProducts) return;

        utils.admin.products.queries.getPage.setData(queryParams, {
          ...oldProducts,
          data: oldProducts.data.filter((p) => p.id !== data.id),
        });

        return { previousProducts: oldProducts };
      },

      onError: (_err, _newTodo, context) => {
        if (!context) return;
        utils.admin.products.queries.getPage.setData(
          queryParams,
          context?.previousProducts,
        );
      },

      onSettled: () => {
        void utils.admin.products.queries.getPage.invalidate(queryParams);
      },
    });

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const parsedActiveId = Number(active.id);
      const parsedOverId = Number(over?.id);

      if (isNaN(parsedActiveId) || isNaN(parsedOverId)) {
        setActiveId(null);
        return;
      }

      updateProductCategory({
        id: parsedActiveId,
        data: { categoryId: parsedOverId },
      });

      // Delay clearing activeId slightly so the overlay can fade/scale near target
      setTimeout(() => setActiveId(null), 180);
    }
  }

  return (
    <DragableContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full overflow-hidden rounded-lg border"
      >
        {/* Category Tree */}
        <ResizablePanel
          className="bg-sidebar flex h-full flex-col gap-2 p-4"
          defaultSize={25}
          minSize={15}
        >
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
            >
              <PlusCircleIcon />
            </Button>
          </div>

          {categories?.map((category) => (
            <CategoryTree
              key={category.id}
              categories={category}
              isDragging={!!activeId}
            />
          ))}
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={75}>
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

            <Button
              variant="ghost"
              className="cursor-pointer rounded-full"
              disabled={!selectedCategory}
            >
              <FolderPlusIcon />
              Add a Sub-Category
            </Button>
          </div>

          <div className="h-full overflow-y-auto p-4">
            <CategoryProductList activeId={activeId} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <DragableOverlay
        withHandle
        className="bg-secondary/95 border-accent/80 flex origin-left scale-50 gap-3 rounded-lg border px-3 py-1 shadow-xl shadow-black/10 backdrop-blur-sm transition-all select-none"
        isDropping={!activeId}
      >
        {activeId && <ProductListItem product={activeProduct} />}
      </DragableOverlay>
    </DragableContext>
  );
}

function CategoryProductList({
  activeId,
}: {
  activeId: UniqueIdentifier | null;
}) {
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);

  const { data: products, isPending: isLoadingProducts } =
    api.admin.products.queries.getPage.useQuery(
      {
        filters: {
          categories: selectedCategory?.id ? [selectedCategory.id] : undefined,
        },
        pageSize: 10,
      },
      {
        enabled: !!selectedCategory,
      },
    );

  if (!selectedCategory) {
    return (
      <div className="flex size-full items-center justify-center">
        <ProductsEmptyState />
      </div>
    );
  }

  if (isLoadingProducts) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.data.length === 0) {
    return <ProductsEmptyState />;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
      {products.data.map((product) => (
        <DragableItem
          id={product.id}
          key={`product-${product.id}`}
          className={cn(
            "bg-secondary border-accent flex gap-3 rounded-lg border px-3 py-1 transition select-none",
            activeId === product.id &&
              "ring-primary/40 scale-[0.98] opacity-40 ring-2",
          )}
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

function ProductListItem({
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

function CategoryTree({
  categories,
  parentCategory,
  isDragging = false,
}: {
  categories: CategoryTree;
  parentCategory?: CategoryTree;
  isDragging?: boolean;
}) {
  const { children, ...category } = categories;
  const hasChildren = children && children.length > 0;

  const addCategoryPortalRef = useRef<HTMLDivElement>(null);
  const AddCategoryPortal = () => <div ref={addCategoryPortalRef} />;

  if (!category) {
    return null;
  }

  if (!hasChildren) {
    return (
      <>
        <CategoryTreeItem
          categories={categories}
          parentCategory={parentCategory}
          addCategoryPortalRef={addCategoryPortalRef}
        />

        <AddCategoryPortal />
      </>
    );
  }

  return (
    <Collapsible className="group/collapsible [&[data-state=open]>div>div>button:first-child>svg:first-child]:rotate-90">
      <CategoryTreeItem
        categories={categories}
        parentCategory={parentCategory}
        addCategoryPortalRef={addCategoryPortalRef}
      />

      <CollapsibleContent>
        {children?.map((subCategories, index) => (
          <div
            key={`category-tree-${category.id}-${index}`}
            className="mt-1 ml-2"
          >
            <CategoryTree
              categories={subCategories}
              parentCategory={category}
              isDragging={isDragging}
            />
          </div>
        ))}
      </CollapsibleContent>

      {/* Add Category Form Portal */}
      <AddCategoryPortal />
    </Collapsible>
  );
}

function CategoryTreeItem({
  categories,
  parentCategory,
  addCategoryPortalRef,
}: {
  categories: CategoryTree;
  parentCategory?: CategoryTree;
  addCategoryPortalRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const setSelectedCategory = useCategoryStore(
    (state) => state.setSelectedCategory,
  );
  const setParentCategory = useCategoryStore(
    (state) => state.setParentCategory,
  );

  const { children, ...category } = categories;
  const Icon = iconsMap.get(category.icon) ?? FolderIcon;
  const isActive = selectedCategory?.id === category.id;
  const hasChildren = children && children.length > 0;

  function handleCategorySelect() {
    setSelectedCategory(category);
    if (parentCategory) {
      setParentCategory(parentCategory);
    }
  }

  return (
    <Droppable
      id={category.id.toString()}
      className="rounded-md"
      classNameWhenOver="ring-2 ring-primary/40 bg-accent/40 rounded-md"
    >
      <div
        className={buttonVariants({
          variant: "ghost",
          className: cn(
            "group w-full justify-between border border-transparent py-0 focus-visible:ring-0",
            isActive &&
              "border-border from-sidebar-accent bg-gradient-to-t to-transparent",
            hasChildren && "has-[button>svg]:px-3",
          ),
        })}
      >
        {hasChildren ? (
          <CollapsibleTrigger className="focus-visible:outline-none">
            <ChevronRight className="transition-transform" />
          </CollapsibleTrigger>
        ) : (
          <ChevronRight
            className={cn(
              "opacity-0 transition-all",
              showAddForm && "rotate-90 opacity-100",
            )}
          />
        )}

        <button
          onClick={handleCategorySelect}
          className="flex size-full cursor-pointer items-center gap-2 py-2 focus-visible:outline-none"
        >
          <Icon />
          {category.name}
        </button>

        <CategoryTreeActions
          categoryId={category.id}
          setShowAddForm={setShowAddForm}
        />
      </div>

      {showAddForm &&
        addCategoryPortalRef.current &&
        createPortal(
          <div className="mt-1 ml-7 p-1">
            <AddCategory
              parentCategoryId={category.id}
              onSuccess={() => setShowAddForm(false)}
              cancel={() => setShowAddForm(false)}
            />
          </div>,
          addCategoryPortalRef.current,
        )}
    </Droppable>
  );
}

function CategoryTreeActions({
  categoryId,
  setShowAddForm,
}: {
  categoryId: number;
  setShowAddForm: (show: boolean) => void;
}) {
  const utils = api.useUtils();
  const { mutate: deleteCategory, isPending: isDeletingCategory } =
    api.admin.categories.mutations.delete.useMutation({
      onSuccess: () => {
        void utils.admin.categories.queries.findAll.invalidate();
      },
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-auto cursor-pointer p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:outline-none">
        <EllipsisVerticalIcon className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start" sideOffset={20}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowAddForm(true)}>
          <PlusIcon />
          Add a Sub-Category
        </DropdownMenuItem>

        <DropdownMenuItem>
          <PencilIcon />
          Edit Category
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          onClick={() => deleteCategory({ id: categoryId })}
        >
          {isDeletingCategory ? <Spinner /> : <TrashIcon />}
          Remove Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
